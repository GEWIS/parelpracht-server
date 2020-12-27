import { getRepository, Repository } from 'typeorm';
import { ProductInstance } from '../entity/ProductInstance';
import { ApiError, HTTPStatus } from '../helpers/error';
// eslint-disable-next-line import/no-cycle
import InvoiceService from './InvoiceService';

export interface ProductInstanceParams {
  productId: number,
  price: number,
  comments?: string;
}

export default class ProductInstanceService {
  repo: Repository<ProductInstance>;

  constructor() {
    this.repo = getRepository(ProductInstance);
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
    const productInstance = {
      ...params,
      contractId,
    } as any as ProductInstance;
    return this.repo.save(productInstance);
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
