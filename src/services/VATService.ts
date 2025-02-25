import { FindManyOptions, Repository } from 'typeorm';
import { ValueAddedTax } from '../entity/ValueAddedTax';
import { ListParams } from '../controllers/ListParams';
import { ApiError, HTTPStatus } from '../helpers/error';
import { addQueryWhereClause } from '../helpers/filters';
import AppDataSource from '../database';
import { VAT } from '../entity/enums/ValueAddedTax';

export interface VATParams {
  category: VAT;
  amount: number;
}

export interface VATSummary {
  id: number;
  amount: number;
}

export interface VATListResponse {
  list: ValueAddedTax[];
  count: number;
}

export default class VATService {
  repo: Repository<ValueAddedTax>;

  constructor() {
    this.repo = AppDataSource.getRepository(ValueAddedTax);
  }

  async getVAT(id: number): Promise<ValueAddedTax> {
    const valueAddedTax = await this.repo.findOne({ where: { id }, relations: ['products'] });
    if (valueAddedTax == null) {
      throw new ApiError(HTTPStatus.NotFound, 'VAT not found');
    }
    return valueAddedTax;
  }

  async getAllVAT(params: ListParams): Promise<VATListResponse> {
    const findOptions: FindManyOptions<ValueAddedTax> = {
      order: {
        [params.sorting?.column ?? 'id']: params.sorting?.direction ?? 'ASC',
      },
    };

    findOptions.where = addQueryWhereClause<ValueAddedTax>(params, ['category']);

    return {
      list: await this.repo.find({
        ...findOptions,
        skip: params.skip,
        take: params.take,
      }),
      count: await this.repo.count(findOptions),
    };
  }

  async getVATSummaries(): Promise<VATSummary[]> {
    return this.repo.find({ select: ['id', 'amount'] });
  }

  async updateVAT(id: number, params: Partial<VATParams>): Promise<ValueAddedTax> {
    await this.repo.update(id, params);
    const valueAddedTax = await this.repo.findOneBy({ id });
    return valueAddedTax!;
  }
}
