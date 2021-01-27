import {
  FindConditions, FindManyOptions, getRepository, ILike, In, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Company } from '../entity/Company';
import { Contact } from '../entity/Contact';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian, cartesianArrays } from '../helpers/filters';
import { CompanyStatus } from '../entity/enums/CompanyStatus';

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
    const company = await this.repo.findOne(id, { relations: ['contracts', 'contacts', 'activities', 'invoices'] }); // May need more relations
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
      const filters: FindConditions<Company> = {};
      params.filters.forEach((f) => {
        // @ts-ignore
        filters[f.column] = f.values.length !== 1 ? In(f.values) : f.values[0];
      });
      conditions.push(filters);
    }

    if (params.search !== undefined && params.search.trim() !== '') {
      const rawSearches: FindConditions<Company>[][] = [];
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

  async deleteCompany(id: number) {
    const company = await this.getCompany(id);
    if (company.contacts.length > 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Company has contracts');
    }
    if (company.invoices.length > 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Company has invoices');
    }
    if (company.contacts.length > 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Company has contacts');
    }

    await this.repo.delete(company.id);
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
