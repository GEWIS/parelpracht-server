import {
  FindManyOptions, getRepository, ILike, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Product, ProductStatus } from '../entity/Product';
import { ApiError, HTTPStatus } from '../helpers/error';

export interface ProductParams {
  nameDutch: string;
  nameEnglish: string;
  targetPrice: number;
  status: ProductStatus;
  description: string;
  contractTextDutch: string;
  contractTextEnglish: string;
  deliverySpecificationDutch?: string;
  deliverySpecificationEnglish?: string;
}

export interface ProductSummary {
  id: number;
  nameDutch: string;
  nameEnglish: string;
  targetPrice: number;
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

  async getProduct(id: number): Promise<Product> {
    const product = await this.repo.findOne(id);
    if (product === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Product not found');
    }
    return product;
  }

  async getAllProducts(params: ListParams): Promise<ProductListResponse> {
    const findOptions: FindManyOptions<Product> = {
      order: {
        [params.sorting?.column ?? 'id']:
        params.sorting?.direction ?? 'ASC',
      },
    };

    if (params.search !== undefined && params.search.trim() !== '') {
      findOptions.where = [
        { nameDutch: ILike(`%${params.search.trim()}%`) },
        { nameEnglish: ILike(`%${params.search.trim()}%`) },
        /* { targetPrice: ILike(`%${params.search.trim()}%`) }, */
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

  async getProductSummaries(): Promise<ProductSummary[]> {
    return this.repo.find({ select: ['id', 'nameDutch', 'nameEnglish', 'targetPrice'] });
  }

  createProduct(params: ProductParams): Promise<Product> {
    const product = {
      ...params,
    };
    return this.repo.save(product);
  }

  async updateProduct(id: number, params: Partial<ProductParams>): Promise<Product> {
    await this.repo.update(id, params);
    const product = await this.repo.findOne(id);
    return product!;
  }
}
