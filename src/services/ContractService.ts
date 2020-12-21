import {
  FindManyOptions, getRepository, Like, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Contract } from '../entity/Contract';
import { ApiError, HTTPStatus } from '../helpers/error';

export interface ContractParams {
  title: string;
  companyId: number;
  contactId: number;
  date: Date;
  poNumber: string;
  comments: string;
}

export interface ContractListResponse {
  list: Contract[];
  count: number;
}

export default class ContractService {
  repo: Repository<Contract>;

  constructor() {
    this.repo = getRepository(Contract);
  }

  async getContract(id: number): Promise<Contract> {
    const contract = await this.repo.findOne(id, { relations: ['company'] }); // May need more relations
    if (contract === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Contract not found');
    }
    return contract;
  }

  async getAllContracts(params: ListParams): Promise<ContractListResponse> {
    const findOptions: FindManyOptions<Contract> = {
      order: {
        [params.sorting?.column ?? 'id']:
        params.sorting?.direction ?? 'ASC',
      },
    };

    if (params.search !== undefined && params.search.trim() !== '') {
      findOptions.where = [
        { title: Like(`%${params.search.trim()}%`) },
        { poNumber: Like(`%${params.search.trim()}%`) },
        /* To add: ID */
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

  async createContract(params: ContractParams): Promise<Contract> {
    let contract = new Contract();
    // @ts-ignore
    contract = {
      ...contract,
      ...params,
    };
    return this.repo.save(contract);
  }

  async updateContract(id: number, params: Partial<ContractParams>): Promise<Contract> {
    await this.repo.update(id, params);
    const contract = await this.repo.findOne(id);
    return contract!;
  }
}
