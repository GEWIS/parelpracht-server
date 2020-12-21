import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query, Delete,
} from 'tsoa';
import { Contract } from '../entity/Contract';
import ContractService, {
  ContractListResponse,
  ContractParams,
} from '../services/ContractService';
import { ListParams } from './ListParams';
import ProductInstanceService, {ProductInstanceParams} from '../services/ProductInstanceService';
import {ProductInstance} from '../entity/ProductInstance';
import {DeleteResult, UpdateResult} from 'typeorm';

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

  /**
   * getContract() - retrieve single contract
   * @param id ID of contract to retrieve
   */
  @Get('{id}')
  public async getContract(id: number): Promise<Contract> {
    return new ContractService().getContract(id);
  }

  /**
   * createContract() - create contract
   * @param params Parameters to create contract with
   */
  @Post()
  public async createContract(@Body() params: ContractParams): Promise<Contract> {
    return new ContractService().createContract(params);
  }

  /**
   * updateContract() - update contract
   * @param id ID of contract to update
   * @param params Update subset of parameter of contract
   */
  @Put('{id}')
  public async updateContract(
    id: number, @Body() params: Partial<ContractParams>,
  ): Promise<Contract> {
    return new ContractService().updateContract(id, params);
  }

  /**
   * Add product to contract
   * @param id - ID of the contract
   * @param params - Create subset of product
   */
  @Post('{id}/product')
  public async addProduct(id: number, @Body() params: ProductInstanceParams): Promise<ProductInstance> {
    return new ProductInstanceService().addProduct(id, params);
  }

  /**
   * Update a product instance in a contract
   * @param id ID of the contract
   * @param prodId ID of the product instance
   * @param params Update subset of product instance
   */
  @Put('{id}/product/{prodId}')
  public async updateProduct(id: number, prodId: number, @Body() params: Partial<ProductInstanceParams>): Promise<ProductInstance> {
    return new ProductInstanceService().updateProduct(id, prodId, params);
  }

  /**
   * Remove product from contract
   * @param id ID of the contract
   * @param prodId ID of the product instance
   */
  @Delete('{id}/product/{prodId}')
  public async deleteProduct(id: number, prodId: number): Promise<void> {
    return new ProductInstanceService().deleteProduct(id, prodId);
  }
}
