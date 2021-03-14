import {
  FindConditions, FindManyOptions, getRepository, ILike, In, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Contract } from '../entity/Contract';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import { ContractActivity } from '../entity/activity/ContractActivity';
// eslint-disable-next-line import/no-cycle
import ActivityService, { FullActivityParams } from './ActivityService';
import ContactService from './ContactService';
import CompanyService from './CompanyService';
import { ContactFunction } from '../entity/enums/ContactFunction';
import { CompanyStatus } from '../entity/enums/CompanyStatus';
import { ActivityType } from '../entity/enums/ActivityType';
import RawQueries, { RecentContract } from '../helpers/rawQueries';
import { ContractStatus } from '../entity/enums/ContractStatus';
import { cartesian, cartesianArrays } from '../helpers/filters';
import { Roles } from '../entity/enums/Roles';
import { ContractSummary } from '../entity/Summaries';
import {
  createActivitiesForEntityEdits,
} from '../helpers/activity';

export interface ContractParams {
  title: string;
  companyId: number;
  contactId: number;
  comments?: string;
  assignedToId?: number;
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
    });
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
      const filters: FindConditions<Contract> = {};
      let statusFilterValues: any[] = [];

      params.filters.forEach((f) => {
        if (f.column === 'activityStatus') {
          statusFilterValues = f.values;
        } else {
          // @ts-ignore
          filters[f.column] = f.values.length !== 1 ? In(f.values) : f.values[0];
        }
      });

      if (statusFilterValues.length > 0) {
        const ids = await new RawQueries().getContractIdsByStatus(statusFilterValues);
        // @ts-ignore
        filters.id = In(ids.map((o) => o.id));
      }

      conditions.push(filters);
    }

    if (params.search !== undefined && params.search.trim() !== '') {
      const rawSearches: FindConditions<Contract>[][] = [];
      params.search.trim().split(' ').forEach((searchTerm) => {
        rawSearches.push([
          { title: ILike(`%${searchTerm}%`) },
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

  async getContractSummaries(): Promise<ContractSummary[]> {
    return new RawQueries().getContractSummaries();
  }

  async getAllContractsExtensive(params: ListParams): Promise<any> {
    return {
      list: await new RawQueries().getContractWithProductsAndTheirStatuses(params, 'data'),
      count: parseInt((await new RawQueries().getContractWithProductsAndTheirStatuses(params, 'count'))[0].count, 10),
    };
  }

  async getRecentContracts(actor: User): Promise<RecentContract[]> {
    const userId = actor.hasRole(Roles.ADMIN) ? undefined : actor.id;
    return new RawQueries().getRecentContractsWithStatus(5, userId);
  }

  async createContract(params: ContractParams): Promise<Contract> {
    const contact = await new ContactService().getContact(params.contactId);
    const company = await new CompanyService().getCompany(params.companyId);
    const assignedToId = params.assignedToId ? params.assignedToId : this.actor?.id;
    let contract = this.repo.create({
      ...params,
      assignedToId,
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
    const contract = await this.getContract(id);

    if (!(await createActivitiesForEntityEdits<Contract>(
      this.repo, contract, params, new ActivityService(ContractActivity, { actor: this.actor }),
    ))) return contract;

    return this.getContract(id);
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

  async transferAssignments(fromUser: User, toUser: User): Promise<void> {
    await this.repo.createQueryBuilder()
      .update()
      .set({ assignedToId: toUser.id })
      .where('assignedToId = :id', { id: fromUser.id })
      .execute();
  }
}
