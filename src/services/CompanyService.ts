import { FindManyOptions, Repository } from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Company } from '../entity/Company';
import { Contact } from '../entity/Contact';
import { ApiError, HTTPStatus } from '../helpers/error';
import { addQueryWhereClause } from '../helpers/filters';
import { CompanyStatus } from '../entity/enums/CompanyStatus';
import FileHelper from '../helpers/fileHelper';
import { createActivitiesForEntityEdits } from '../helpers/activity';
import { CompanyActivity } from '../entity/activity/CompanyActivity';
import { User } from '../entity/User';
import ActivityService from './ActivityService';
import RawQueries, { ETCompany } from '../helpers/rawQueries';
import AppDataSource from '../database';

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
}

export interface CompanySummary {
  id: number;
  name: string;
  logoFilename: string;
  status: CompanyStatus;
}

export interface CompanyListResponse {
  list: Company[];
  count: number;
}

export interface ETCompanyListResponse {
  list: ETCompany[];
  count: number;
  extra: {
    sumProducts: number;
    nrOfProducts: number;
  };
}

export default class CompanyService {
  repo: Repository<Company>;

  /** Represents the logged in user, performing an operation */
  actor?: User;

  constructor(options?: { actor?: User }) {
    this.repo = AppDataSource.getRepository(Company);
    this.actor = options?.actor;
  }

  async getCompany(id: number): Promise<Company> {
    const company = await this.repo.findOne({
      where: { id },
      relations: ['contracts', 'contacts', 'activities', 'invoices', 'files'],
    }); // May need more relations
    if (company == null) {
      throw new ApiError(HTTPStatus.NotFound, 'Company not found');
    }
    return company;
  }

  async getAllCompanies(params: ListParams): Promise<CompanyListResponse> {
    const findOptions: FindManyOptions<Company> = {
      order: {
        [params.sorting?.column ?? 'id']: params.sorting?.direction ?? 'ASC',
      },
    };

    findOptions.where = addQueryWhereClause(params, ['name']);

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
    return this.repo.find({ select: ['id', 'name', 'logoFilename', 'status'] });
  }

  createCompany(params: CompanyParams): Promise<Company> {
    const company = {
      ...params,
    } as any as Company;
    return this.repo.save(company);
  }

  async updateCompany(id: number, params: Partial<CompanyParams>): Promise<Company> {
    const company = await this.getCompany(id);

    if (
      !(await createActivitiesForEntityEdits<Company>(
        this.repo,
        company,
        params,
        new ActivityService(new CompanyActivity(), { actor: this.actor }),
        CompanyActivity,
      ))
    )
      return company;

    return this.getCompany(id);
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
    if (company.files.length > 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Company has files');
    }

    await this.repo.delete(company.id);
  }

  async deleteCompanyLogo(id: number): Promise<Company> {
    const company = await this.getCompany(id);
    if (company.logoFilename === '') return company;

    try {
      FileHelper.removeFileAtLoc(company.logoFilename);
    } finally {
      await this.repo.update(company.id, { logoFilename: '' });
    }

    return this.getCompany(id);
  }

  async getContacts(id: number): Promise<Contact[]> {
    const company = await this.repo.findOne({ where: { id }, relations: ['contracts', 'contacts', 'activities'] }); // May need more relations
    if (company == null) {
      throw new ApiError(HTTPStatus.NotFound, 'Company not found');
    }

    return AppDataSource.getRepository(Contact).find({
      where: {
        companyId: id,
      },
    });
  }

  async getAllCompaniesExtensive(params: ListParams): Promise<ETCompanyListResponse> {
    return {
      list: await new RawQueries().getContractWithProductsAndTheirStatuses(params),
      count: await new RawQueries().getContractWithProductsAndTheirStatusesCount(params),
      extra: {
        nrOfProducts: await new RawQueries().getContractWithProductsAndTheirStatusesCountProd(params),
        sumProducts: await new RawQueries().getContractWithProductsAndTheirStatusesSumProducts(params),
      },
    };
  }
}
