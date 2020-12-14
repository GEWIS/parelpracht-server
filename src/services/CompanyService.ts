import { getRepository, Repository } from 'typeorm';
import { Company, CompanyStatus } from '../entity/Company';

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

  create(params: CompanyParams): Promise<Company> {
    let company = new Company();
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
