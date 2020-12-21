import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query,
} from 'tsoa';
import { Contract } from '../entity/Contract';
import ContractService, { ContractListResponse, ContractParams } from '../services/ContractService';
import { ListParams } from './ListParams';

@Route('contract')
@Tags('Contract')
export class ContractController extends Controller {
  /**
   * getAllCompanies() - retrieve multiple contracts
   * @param col Sorted column
   * @param dir Sorting direction
   * @param skip Number of elements to skip
   * @param take Amount of elements to request
   * @param search String to filter on value of select columns
   */
  @Get()
  public async getAllContracts(
    @Query() col?: string,
      @Query() dir?: 'ASC' | 'DESC',
      @Query() skip?: number,
      @Query() take?: number,
      @Query() search?: string,
  ): Promise<ContractListResponse> {
    const lp: ListParams = { skip, take, search };
    if (col && dir) { lp.sorting = { column: col, direction: dir }; }
    return new ContractService().getAllContracts(lp);
  }

  @Get('{id}')
  public async getContract(id: number): Promise<Contract> {
    return new ContractService().getContract(id);
  }

  @Post()
  public async createContract(@Body() params: ContractParams): Promise<Contract> {
    return new ContractService().createContract(params);
  }

  @Put('{id}')
  public async updateContract(
    id: number, @Body() params: Partial<ContractParams>,
  ): Promise<Contract> {
    return new ContractService().updateContract(id, params);
  }
}
