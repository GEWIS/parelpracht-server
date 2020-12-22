import {
  FindManyOptions, getRepository, Like, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Company, CompanyStatus } from '../entity/Company';
import { ApiError, HTTPStatus } from '../helpers/error';

// May not be correct yet
export interface CompanyParams {
  name: string;
  description?: string;
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
    const company = await this.repo.findOne(id, { relations: ['contracts', 'contacts'] }); // May need more relations
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

    if (params.search !== undefined && params.search.trim() !== '') {
      findOptions.where = [
        { name: Like(`%${params.search.trim()}%`) },
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
}
