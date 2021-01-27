import {
  FindConditions, FindManyOptions, getRepository, ILike, In, Repository,
} from 'typeorm';
import { ProductCategory } from '../entity/ProductCategory';
import { ListParams } from '../controllers/ListParams';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian, cartesianArrays } from '../helpers/filters';

export interface CategoryParams {
  name: string;
}

export interface CategorySummary {
  id: number;
  name: string;
}

export interface CategoryListResponse {
  list: ProductCategory[];
  count: number;
}

export default class ProductCategoryService {
  repo: Repository<ProductCategory>;

  constructor() {
    this.repo = getRepository(ProductCategory);
  }

  async getCategory(id: number): Promise<ProductCategory> {
    const productCategory = await this.repo.findOne(id, { relations: ['products'] });
    if (productCategory === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Product Category not found');
    }
    return productCategory;
  }

  async getAllCategories(params: ListParams): Promise<CategoryListResponse> {
    const findOptions: FindManyOptions<ProductCategory> = {
      order: {
        [params.sorting?.column ?? 'id']:
        params.sorting?.direction ?? 'ASC',
      },
    };

    let conditions: FindConditions<ProductCategory>[] = [];

    if (params.filters !== undefined) {
      const filters: FindConditions<ProductCategory> = {};
      params.filters.forEach((f) => {
        // @ts-ignore
        filters[f.column] = f.values.length !== 1 ? In(f.values) : f.values[0];
      });
      conditions.push(filters);
    }

    if (params.search !== undefined && params.search.trim() !== '') {
      const rawSearches: FindConditions<ProductCategory>[][] = [];
      params.search.trim().split(' ').forEach((searchTerm) => {
        rawSearches.push([
          { name: ILike(`%${searchTerm}%`) },
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

  async getCategorySummaries(): Promise<CategorySummary[]> {
    return this.repo.find({ select: ['id', 'name'] });
  }

  async createCategory(params: CategoryParams): Promise<ProductCategory> {
    const category = {
      ...params,
    } as any as ProductCategory;
    return this.repo.save(category);
  }

  async updateCategory(
    id: number, params: Partial<CategoryParams>,
  ): Promise<ProductCategory> {
    await this.repo.update(id, params);
    const category = await this.repo.findOne(id);
    return category!;
  }

  async deleteCategory(id: number) {
    const category = await this.getCategory(id);

    if (category.products.length > 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Product Category has products');
    }

    await this.repo.delete(category.id);
  }
}
