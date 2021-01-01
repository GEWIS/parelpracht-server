import _ from 'lodash';
import {
  FindConditions,
  FindManyOptions, getRepository, ILike, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Product, ProductStatus } from '../entity/Product';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian } from '../helpers/filters';

export interface ProductParams {
  nameDutch: string;
  nameEnglish: string;
  targetPrice: number;
  status: ProductStatus;
  description: string;
  categoryId: number;
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
    const product = await this.repo.findOne(id, { relations: ['files', 'activities'] });
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

    let conditions: FindConditions<Product>[] = [];

    if (params.filters !== undefined) {
      // For each filter value, an OR clause is created
      const filters = params.filters.map((f) => f.values.map((v) => ({
        [f.column]: v,
      })));
      // Add the clauses to the where object
      conditions = conditions.concat(_.flatten(filters));
    }

    if (params.search !== undefined && params.search.trim() !== '') {
      conditions = cartesian(conditions, [
        { nameDutch: ILike(`%${params.search.trim()}%`) },
        { nameEnglish: ILike(`%${params.search.trim()}%`) },
      ]);
    }
    findOptions.where = conditions;

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
