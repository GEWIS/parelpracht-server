import { getRepository, Repository } from 'typeorm';
import { Contract } from '../entity/Contract';
import { ApiError, HTTPStatus } from '../error';

export interface ContractParams {
  title: string;
  companyId: number;
  date: Date;
  poNumber: string;
  comments: string;
}

export default class ContractService {
  repo: Repository<Contract>;

  constructor() {
    this.repo = getRepository(Contract);
  }

  async get(id: number): Promise<Contract> {
    const contract = await this.repo.findOne(id, { relations: ['company'] });
    if (contract === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Contract not found');
    }
    return contract;
  }

  async getAll(): Promise<Contract[]> {
    return this.repo.find();
  }

  async create(params: ContractParams): Promise<Contract> {
    let contract = new Contract();
    contract = {
      ...contract,
      ...params,
    };
    return this.repo.save(contract);
  }

  async update(id: number, params: Partial<ContractParams>): Promise<Contract> {
    await this.repo.update(id, params);
    const contract = await this.repo.findOne(id);
    return contract!;
  }
}
