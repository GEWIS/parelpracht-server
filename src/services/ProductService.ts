import {
  FindConditions, FindManyOptions, getRepository, ILike, In, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { ProductStatus } from '../entity/enums/ProductStatus';
import { Product } from '../entity/Product';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian, cartesianArrays } from '../helpers/filters';
import { User } from '../entity/User';
import { createActivitiesForEntityEdits } from '../helpers/activity';
import { ProductActivity } from '../entity/activity/ProductActivity';
import ActivityService from './ActivityService';
import { ProductPricing } from '../entity/ProductPricing';

export interface ProductParams {
  nameDutch: string;
  nameEnglish: string;
  targetPrice: number;
  minTarget?: number;
  maxTarget?: number;
  status: ProductStatus;
  description?: string;
  categoryId: number;
  contractTextDutch: string;
  contractTextEnglish: string;
  deliverySpecificationDutch?: string;
  deliverySpecificationEnglish?: string;
}

export interface PricingParams {
  description: string;
  data: string;
}

export interface ProductSummary {
  id: number;
  nameDutch: string;
  nameEnglish: string;
  targetPrice: number;
  status: ProductStatus;
}

export interface ProductListResponse {
  list: Product[];
  count: number;
}

export default class ProductService {
  repo: Repository<Product>;

  pricingRepo: Repository<ProductPricing>;

  /** Represents the logged in user, performing an operation */
  actor?: User;

  constructor(options?: { actor?: User }) {
    this.repo = getRepository(Product);
    this.pricingRepo = getRepository(ProductPricing);
    this.actor = options?.actor;
  }

  async getProduct(id: number, relations: string[] = []): Promise<Product> {
    const product = await this.repo.findOne(id, { relations: ['files', 'activities', 'pricing'].concat(relations) });
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
      const filters: FindConditions<Product> = {};
      params.filters.forEach((f) => {
        // @ts-ignore
        filters[f.column] = f.values.length !== 1 ? In(f.values) : f.values[0];
      });
      conditions.push(filters);
    }

    if (params.search !== undefined && params.search.trim() !== '') {
      const rawSearches: FindConditions<Product>[][] = [];
      params.search.trim().split(' ').forEach((searchTerm) => {
        rawSearches.push([
          { nameDutch: ILike(`%${searchTerm}%`) },
          { nameEnglish: ILike(`%${searchTerm}%`) },
        ]);
      });
      const searches = cartesianArrays(rawSearches);
      if (conditions.length > 0) {
        conditions = cartesian(conditions, searches);
      } else {
        conditions = searches;
      }
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
    return this.repo.find({ select: ['id', 'nameDutch', 'nameEnglish', 'targetPrice', 'status'] });
  }

  createProduct(params: ProductParams): Promise<Product> {
    const product = {
      ...params,
    };
    return this.repo.save(product);
  }

  async updateProduct(id: number, params: Partial<ProductParams>): Promise<Product> {
    const product = await this.getProduct(id);

    if (!(await createActivitiesForEntityEdits<Product>(
      this.repo, product, params, new ActivityService(ProductActivity, { actor: this.actor }),
    ))) return product;

    return this.getProduct(id);
  }

  async deleteProduct(id: number) {
    const product = await this.getProduct(id, ['instances']);
    if (product.instances.length > 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Product is used in contracts');
    }
    if (product.files.length > 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Product has files attached to it');
    }

    await this.repo.delete(product.id);
  }

  private async getPricing(id: number): Promise<ProductPricing> {
    const pricing = await this.pricingRepo.findOne(id);
    if (pricing === undefined) throw new ApiError(HTTPStatus.NotFound);
    return pricing;
  }

  async addPricing(id: number): Promise<ProductPricing> {
    await this.getProduct(id);
    const pricing = await this.pricingRepo.findOne(id);
    if (pricing !== undefined) {
      throw new ApiError(HTTPStatus.BadRequest, 'This product already has a pricing attribute');
    }

    await this.pricingRepo.save({
      id,
      description: '',
      data: JSON.stringify([['']]),
    } as ProductPricing);
    return this.getPricing(id);
  }

  async updatePricing(
    id: number, params: Partial<PricingParams>,
  ): Promise<ProductPricing> {
    const pricing = await this.getPricing(id);
    await this.pricingRepo.update(pricing.id, params);
    return this.getPricing(pricing.id);
  }

  async deletePricing(id: number) {
    const pricing = await this.getPricing(id);
    await this.pricingRepo.delete(pricing.id);
  }
}
