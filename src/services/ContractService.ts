import _ from 'lodash';
import {
  FindConditions,
  FindManyOptions, getRepository, Like, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Contract } from '../entity/Contract';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian } from '../helpers/filters';

export interface ContractParams {
  title: string;
  companyId: number;
  contactId: number;
  comments?: string;
  assignedToId?: number;
}

export interface ContractSummary {
  id: number;
  title: string;
}

export interface ContractListResponse {
  list: Contract[];
  count: number;
}

export default class ContractService {
  repo: Repository<Contract>;

  /** Represents the logged in user, performing an operation */
  actor?: User;

  constructor(options?: { actor?: User }) {
    this.repo = getRepository(Contract);
    this.actor = options?.actor;
  }

  async getContract(id: number): Promise<Contract> {
    const contract = await this.repo.findOne(id, {
      relations: ['company', 'products', 'contractActivity', 'products.productInstanceActivities', 'products.invoice'],
    }); // May need more relations
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

    let conditions: FindConditions<Contract>[] = [];

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
        { title: Like(`%${params.search.trim()}%`) },
      ]);
    }
    findOptions.where = conditions;

    if (params.search !== undefined && params.search.trim() !== '') {
      findOptions.where = [

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

  async getContractSummaries(): Promise<ContractSummary[]> {
    return this.repo.find({ select: ['id', 'title'] });
  }

  async createContract(params: ContractParams): Promise<Contract> {
    const contract = this.repo.create({
      ...params,
      createdById: this.actor?.id,
    });
    return this.repo.save(contract);
  }

  async updateContract(id: number, params: Partial<ContractParams>): Promise<Contract> {
    await this.repo.update(id, params);
    const contract = await this.repo.findOne(id);
    return contract!;
  }
}
