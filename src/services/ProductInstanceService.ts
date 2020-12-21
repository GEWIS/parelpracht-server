import { DeleteResult, getRepository, Repository } from 'typeorm';
import { ProductInstance } from '../entity/ProductInstance';
import ContractService from './ContractService';
import { ApiError, HTTPStatus } from '../helpers/error';

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

  validateProductInstance(productInstance: ProductInstance | undefined, contractId: number): ProductInstance {
    if (productInstance === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'ProductInstance not found');
    }
    if (productInstance.contractId !== contractId) {
      throw new ApiError(HTTPStatus.BadRequest, 'ProductInstance does not belong to this product');
    }
    return productInstance;
  }

  async addProduct(contractId: number, params: ProductInstanceParams): Promise<ProductInstance> {
    const contract = await new ContractService().getContract(contractId);
    const productInstance = {
      contract,
      ...params,
    } as any as ProductInstance;
    return this.repo.save(productInstance);
    // TODO: Fix that the contract is also passed on with the product
  }

  async updateProduct(contractId: number, productInstanceId: number, params: Partial<ProductInstance>): Promise<ProductInstance> {
    let productInstance = await this.repo.findOne(productInstanceId);
    productInstance = this.validateProductInstance(productInstance, contractId);
    await this.repo.update(productInstance.id, params);
    productInstance = await this.repo.findOne(productInstanceId)!;
    return productInstance!;
  }

  async deleteProduct(contractId: number, productInstanceId: number): Promise<void> {
    const productInstance = await this.repo.findOne(productInstanceId);
    this.validateProductInstance(productInstance, contractId);
    await this.repo.delete(productInstance!);
  }
}
