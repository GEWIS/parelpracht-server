import { getRepository, Repository } from 'typeorm';
import { Product } from '../entity/Product';
import { ApiError, HTTPStatus } from '../error';

export interface ProductParams {
  nameDutch: string;
  nameEnglish: string;
  targetPrice: number;
  description: string;
  contractTextDutch: string;
  contractTextEnglish: string;
  deliverySpecificationDutch: string;
  deliverySpecificationEnglish: string;
}

export default class ProductService {
  repo: Repository<Product>;

  constructor() {
    this.repo = getRepository(Product);
  }

  async get(id: number): Promise<Product> {
    const product = await this.repo.findOne(id);
    if (product === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Product not found');
    }
    return product;
  }

  async getAll(): Promise<Product[]> {
    return this.repo.find();
  }

  create(params: ProductParams): Promise<Product> {
    let product = new Product();
    product = {
      ...product,
      ...params,
    };
    return this.repo.save(product);
  }

  async update(id: number, params: Partial<ProductParams>): Promise<Product> {
    await this.repo.update(id, params);
    const product = await this.repo.findOne(id);
    return product!;
  }
}
