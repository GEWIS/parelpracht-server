import {
  FindConditions,
  FindManyOptions, getRepository, ILike, Repository,
} from 'typeorm';
import _ from 'lodash';
import { ListParams } from '../controllers/ListParams';
import { Company, CompanyStatus } from '../entity/Company';
import { Contact } from '../entity/Contact';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian } from '../helpers/filters';

// May not be correct yet
export interface CompanyParams {
  name: string;
  comments?: string;
  phoneNumber?: string;
  addressStreet: string;
  addressPostalCode: string;
  addressCity: string;
  addressCountry: string;
  invoiceAddressStreet?: string;
  invoiceAddressPostalCode?: string;
  invoiceAddressCity?: string;
  invoiceAddressCountry?: string;
  status?: CompanyStatus;
  endDate?: Date;
}

export interface CompanySummary {
  id: number;
  name: string;
}

export interface CompanyListResponse {
  list: Company[];
  count: number;
}

export default class CompanyService {
  repo: Repository<Company>;

  constructor() {
    this.repo = getRepository(Company);
  }

  async getCompany(id: number): Promise<Company> {
    const company = await this.repo.findOne(id, { relations: ['contracts', 'contacts', 'activities'] }); // May need more relations
    if (company === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Company not found');
    }
    return company;
  }

  async getAllCompanies(params: ListParams): Promise<CompanyListResponse> {
    const findOptions: FindManyOptions<Company> = {
      order: {
        [params.sorting?.column ?? 'id']:
        params.sorting?.direction ?? 'ASC',
      },
    };

    let conditions: FindConditions<Company>[] = [];

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
        { name: ILike(`%${params.search!.trim()}%`) },
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

  async getCompanySummaries(): Promise<CompanySummary[]> {
    return this.repo.find({ select: ['id', 'name'] });
  }

  createCompany(params: CompanyParams): Promise<Company> {
    const company = {
      ...params,
    } as any as Company;
    return this.repo.save(company);
  }

  async updateCompany(id: number, params: Partial<CompanyParams>): Promise<Company> {
    await this.repo.update(id, params);
    const company = await this.repo.findOne(id);
    return company!;
  }

  async getContacts(id: number): Promise<Contact[]> {
    const company = await this.repo.findOne(id, { relations: ['contracts', 'contacts', 'activities'] }); // May need more relations
    if (company === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Company not found');
    }

    const contacts = await getRepository(Contact).find({
      where: {
        companyId: id,
      },
    });

    return contacts;
  }
}
