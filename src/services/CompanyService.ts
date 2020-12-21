import { getRepository, Repository } from 'typeorm';
import { Company, CompanyStatus } from '../entity/Company';
import { ApiError, HTTPStatus } from '../helpers/error';

export interface CompanyParams {
  name: string;
  description: string;
  phoneNumber: string;
  comments: string;
  status: CompanyStatus;
  endDate?: Date;
}

export default class CompanyService {
  repo: Repository<Company>;

  constructor() {
    this.repo = getRepository(Company);
  }

  async get(id: number): Promise<Company> {
    const company = await this.repo.findOne(id, { relations: ['contracts'] });
    if (company === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Company not found');
    }
    return company;
  }

  async getAll(): Promise<Company[]> {
    return this.repo.find();
  }

  create(params: CompanyParams): Promise<Company> {
    let company = new Company();
    // @ts-ignore
    company = {
      ...company,
      ...params,
    };
    return this.repo.save(company);
  }

  async update(id: number, params: Partial<CompanyParams>): Promise<Company> {
    await this.repo.update(id, params);
    const company = await this.repo.findOne(id);
    return company!;
  }
}
