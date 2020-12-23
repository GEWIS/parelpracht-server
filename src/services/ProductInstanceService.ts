import { getRepository, Repository } from 'typeorm';
import { ProductInstance } from '../entity/ProductInstance';
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

  validateProductInstanceContract(productInstance: ProductInstance | undefined, contractId: number): ProductInstance {
    if (productInstance === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'ProductInstance not found');
    }
    if (productInstance.contractId !== contractId) {
      throw new ApiError(HTTPStatus.BadRequest, 'ProductInstance does not belong to this product');
    }
    return productInstance;
  }

  async validateProductInstanceContractB(contractId: number, productInstanceId: number): Promise<void> {
    const productInstance = await this.repo.findOne(productInstanceId);
    this.validateProductInstanceContract(productInstance, contractId);
  }

  async addProduct(contractId: number, params: ProductInstanceParams): Promise<ProductInstance> {
    const productInstance = {
      ...params,
    } as any as ProductInstance;
    return this.repo.save(productInstance);
    // TODO: Fix that the contract is also passed on with the product
  }

  async updateProduct(contractId: number, productInstanceId: number, params: Partial<ProductInstance>): Promise<ProductInstance> {
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
}
