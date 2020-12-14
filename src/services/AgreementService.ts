import { getRepository, Repository } from 'typeorm';
import { Agreement } from '../entity/Agreement';
import { ApiError, HTTPStatus } from '../error';

export interface AgreementParams {
  title: string;
  companyId: number;
  date: Date;
  poNumber: string;
  comments: string;
}

export default class AgreementService {
  repo: Repository<Agreement>;

  constructor() {
    this.repo = getRepository(Agreement);
  }

  async get(id: number): Promise<Agreement> {
    const agreement = await this.repo.findOne(id, { relations: ['company'] });
    if (agreement === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Agreement not found');
    }
    return agreement;
  }

  async create(params: AgreementParams): Promise<Agreement> {
    let agreement = new Agreement();
    agreement = {
      ...agreement,
      ...params,
    };
    return this.repo.save(agreement);
  }

  async update(id: number, params: Partial<AgreementParams>): Promise<Agreement> {
    await this.repo.update(id, params);
    const agreement = await this.repo.findOne(id);
    return agreement!;
  }
}
