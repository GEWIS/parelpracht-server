import { getRepository, Repository } from 'typeorm';
import { ProductInstance } from '../entity/ProductInstance';
import { ApiError, HTTPStatus } from '../helpers/error';
// eslint-disable-next-line import/no-cycle
import InvoiceService from './InvoiceService';
// eslint-disable-next-line import/no-cycle
import ActivityService, { FullActivityParams } from './ActivityService';
import { ActivityType } from '../entity/activity/BaseActivity';
import { ProductInstanceActivity, ProductInstanceStatus } from '../entity/activity/ProductInstanceActivity';
import { User } from '../entity/User';
import { ContractActivity, ContractStatus } from '../entity/activity/ContractActivity';
import { InvoiceActivity, InvoiceStatus } from '../entity/activity/InvoiceActivity';

export interface ProductInstanceParams {
  productId: number,
  price: number,
  comments?: string;
}

export default class ProductInstanceService {
  repo: Repository<ProductInstance>;

  actor?: User;

  constructor(options?: {actor?: User}) {
    this.repo = getRepository(ProductInstance);
    this.actor = options?.actor;
  }

  validateProductInstanceContract(
    productInstance: ProductInstance | undefined, contractId: number,
  ): ProductInstance {
    if (productInstance === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'ProductInstance not found');
    }
    if (productInstance.contractId !== contractId) {
      throw new ApiError(HTTPStatus.BadRequest, 'ProductInstance does not belong to this product');
    }
    return productInstance;
  }

  async validateProductInstanceContractB(
    contractId: number, productInstanceId: number,
  ): Promise<void> {
    const productInstance = await this.repo.findOne(productInstanceId);
    this.validateProductInstanceContract(productInstance, contractId);
  }

  async addProduct(contractId: number, params: ProductInstanceParams): Promise<ProductInstance> {
    let productInstance = {
      ...params,
      contractId,
    } as any as ProductInstance;

    const statuses = await new ActivityService(ContractActivity).getStatuses({ contractId });
    if (statuses.includes(ContractStatus.CONFIRMED) || statuses.includes(ContractStatus.FINISHED)
      || statuses.includes(ContractStatus.CANCELLED)) {
      throw new ApiError(HTTPStatus.BadRequest, 'Cannot add product to this contract, because the contract is already confirmed, finished or delivered');
    }

    productInstance = await this.repo.save(productInstance);

    await new ActivityService(ProductInstanceActivity, { actor: this.actor }).createActivity({
      entityId: productInstance.id,
      type: ActivityType.STATUS,
      subType: ProductInstanceStatus.NOTDELIVERED,
      description: '',
    } as FullActivityParams);

    productInstance = (await this.repo.findOne(productInstance.id, { relations: ['activities'] }))!;
    return productInstance;

    // TODO: Fix that the contract is also passed on with the product
  }

  async getProduct(id: number, relations: string[] = []): Promise<ProductInstance> {
    const product = await this.repo.findOne(id, { relations }); // Relations still have to be added
    if (product === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'ProductInstance not found');
    }
    return product;
  }

  async updateProduct(
    contractId: number, productInstanceId: number, params: Partial<ProductInstance>,
  ): Promise<ProductInstance> {
    let productInstance = await this.repo.findOne(productInstanceId);
    productInstance = this.validateProductInstanceContract(productInstance, contractId);
    await this.repo.update(productInstance.id, params);
    productInstance = await this.repo.findOne(productInstanceId)!;
    return productInstance!;
  }

  async deleteProduct(contractId: number, productInstanceId: number): Promise<void> {
    let productInstance = await this.repo.findOne(productInstanceId);
    productInstance = this.validateProductInstanceContract(productInstance, contractId);
    await this.repo.delete(productInstance.id);
  }

  async addInvoiceProduct(invoiceId: number, productId: number): Promise<ProductInstance> {
    const productInstance = await this.getProduct(productId, ['contract']);
    console.log(productInstance);
    const invoice = await new InvoiceService().getInvoice(invoiceId);
    // Verify that this productInstance doesn't already belong to an invoice
    if (productInstance.invoiceId !== null) {
      throw new ApiError(HTTPStatus.BadRequest, 'ProductInstance already belongs to an invoice');
    }
    // Verify that the product instance and the invoice share the same company
    if (invoice.companyId !== productInstance.contract.companyId) {
      throw new ApiError(HTTPStatus.BadRequest, 'ProductInstance does not belong to the same company as the invoice');
    }

    const statuses = await new ActivityService(InvoiceActivity).getStatuses({ invoiceId });
    if (statuses.includes(InvoiceStatus.CANCELLED) || statuses.includes(InvoiceStatus.PAID)
      || statuses.includes(InvoiceStatus.SENT) || statuses.includes(InvoiceStatus.IRRECOVERABLE)) {
      throw new ApiError(HTTPStatus.BadRequest, 'Cannot add product to this invoice, because the invoice is already sent or finished');
    }

    productInstance.invoiceId = invoiceId;
    return this.repo.save(productInstance);
  }

  async deleteInvoiceProduct(invoiceId: number, productId: number): Promise<void> {
    const product = await this.getProduct(productId);
    if (product.invoiceId !== invoiceId || product.invoice?.id !== invoiceId) {
      throw new ApiError(HTTPStatus.BadRequest, 'ProductInstance does not belongs to this invoice');
    }

    await this.repo.delete(product.id);
  }
}
