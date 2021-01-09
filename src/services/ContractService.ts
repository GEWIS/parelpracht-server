import _ from 'lodash';
import {
  FindConditions, FindManyOptions, getRepository, ILike, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Contract } from '../entity/Contract';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian } from '../helpers/filters';
import { ContractActivity, ContractStatus } from '../entity/activity/ContractActivity';
// eslint-disable-next-line import/no-cycle
import ActivityService, { FullActivityParams } from './ActivityService';
import { ActivityType } from '../entity/activity/BaseActivity';
import ContactService from './ContactService';
import CompanyService from './CompanyService';
import { ContactFunction } from '../entity/Contact';
import { CompanyStatus } from '../entity/Company';

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

  async getContract(id: number, relations: string[] = []): Promise<Contract> {
    const contract = await this.repo.findOne(id, {
      relations: ['contact', 'company', 'products', 'activities', 'products.activities', 'products.invoice', 'files', 'files.createdBy'].concat(relations),
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
        { title: ILike(`%${params.search.trim()}%`) },
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

  async getContractSummaries(): Promise<ContractSummary[]> {
    return this.repo.find({ select: ['id', 'title'] });
  }

  async createContract(params: ContractParams): Promise<Contract> {
    const contact = await new ContactService().getContact(params.contactId);
    const company = await new CompanyService().getCompany(params.companyId);
    let contract = this.repo.create({
      ...params,
      createdById: this.actor?.id,
    });

    if (contact.function === ContactFunction.OLD) {
      throw new ApiError(HTTPStatus.BadRequest, 'Cannot create contract with old, inactive contact person');
    }
    if (company.status === CompanyStatus.INACTIVE) {
      throw new ApiError(HTTPStatus.BadRequest, 'Cannot create contract with inactive company');
    }

    contract = await this.repo.save(contract);

    await new ActivityService(ContractActivity, { actor: this.actor }).createActivity({
      entityId: contract.id,
      type: ActivityType.STATUS,
      subType: ContractStatus.CREATED,
      description: '',
    } as FullActivityParams);

    return this.getContract(contract.id);
  }

  async updateContract(id: number, params: Partial<ContractParams>): Promise<Contract> {
    await this.repo.update(id, params);
    const contract = await this.repo.findOne(id);
    return contract!;
  }

  async deleteContract(id: number): Promise<void> {
    const contract = await this.getContract(id);

    if (contract.products.length > 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Contract has products');
    }
    if (contract.activities.filter((a) => a.type === ActivityType.STATUS).length > 1) {
      throw new ApiError(HTTPStatus.BadRequest, 'Contract has changed its status');
    }

    await this.repo.delete(id);
  }
}
