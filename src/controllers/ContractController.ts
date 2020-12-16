import {
  Body,
  Controller, Post, Route, Put, Get, Tags,
} from 'tsoa';
import { Contract } from '../entity/Contract';
import ContractService, { ContractParams } from '../services/ContractService';

@Route('contract')
@Tags('Contract')
export class ContractController extends Controller {
  @Get('{id}')
  public async getContract(id: number): Promise<Contract> {
    return new ContractService().get(id);
  }

  @Post()
  public async createContract(@Body() params: ContractParams): Promise<Contract> {
    return new ContractService().create(params);
  }

  @Put('{id}')
  public async updateContract(
    id: number, @Body() params: Partial<ContractParams>,
  ): Promise<Contract> {
    return new ContractService().update(id, params);
  }
}
