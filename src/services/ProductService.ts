import {
  FindManyOptions, getRepository, Like, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Product, ProductStatus } from '../entity/Product';
import { ApiError, HTTPStatus } from '../helpers/error';

export interface ProductParams {
  nameDutch: string;
  nameEnglish: string;
  targetPrice: number;
  description: string;
  status: ProductStatus;
  contractTextDutch: string;
  contractTextEnglish: string;
  deliverySpecificationDutch: string;
  deliverySpecificationEnglish: string;
}

export interface ProductListResponse {
  list: Product[];
  count: number;
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

  async getAll(params: ListParams): Promise<ProductListResponse> {
    const findOptions: FindManyOptions<Product> = {
      order: {
        [params.sorting?.column ?? 'id']:
        params.sorting?.direction ?? 'ASC',
      },
    };

    if (params.search !== undefined && params.search.trim() !== '') {
      findOptions.where = [
        { nameDutch: Like(`%${params.search.trim()}%`) },
        { nameEnglish: Like(`%${params.search.trim()}%`) },
        /* { targetPrice: Like(`%${params.search.trim()}%`) }, */
      ];
    }

    return {
      list: await this.repo.find({
        ...findOptions,
        skip: params.skip,
        take: params.take,
      }),
      count: await this.repo.count(findOptions),
    };
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
