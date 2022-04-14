import {
  FindOptionsWhere, FindManyOptions, getRepository, ILike, In, Repository,
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
import { addQueryWhereClause, cartesian, cartesianArrays } from '../helpers/filters';
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
    const contract = await this.repo.findOne({
      where: { id },
      relations: ['contact', 'company', 'products', 'activities', 'products.activities', 'products.invoice', 'files', 'files.createdBy'].concat(relations),
    });
    if (contract == null) {
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

    findOptions.where = addQueryWhereClause<Contract>(params, ['title']);

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

    await new ActivityService(new ContractActivity, { actor: this.actor }).createActivity(ContractActivity, {
      entityId: contract.id,
      type: ActivityType.STATUS,
      subType: ContractStatus.CREATED,
      descriptionDutch: '',
      descriptionEnglish: '',
    } as FullActivityParams);

    return this.getContract(contract.id);
  }

  async updateContract(id: number, params: Partial<ContractParams>): Promise<Contract> {
    const contract = await this.getContract(id);

    if (!(await createActivitiesForEntityEdits<Contract>(
      this.repo, contract, params, new ActivityService(new ContractActivity, { actor: this.actor }), ContractActivity,
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
