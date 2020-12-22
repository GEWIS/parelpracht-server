import {
  Body,
  Tags, Controller, Post, Route, Put, Get, Query,
} from 'tsoa';
import { Company } from '../entity/Company';
import CompanyService, { CompanyListResponse, CompanyParams, CompanySummary } from '../services/CompanyService';
import { ListParams } from './ListParams';

@Route('company')
@Tags('Company')
export class CompanyController extends Controller {
  /**
   * getAllCompanies() - retrieve multiple companies
   * @param col Sorted column
   * @param dir Sorting direction
   * @param skip Number of elements to skip
   * @param take Amount of elements to request
   * @param search String to filter on value of select columns
   */
  @Get()
  public async getAllCompanies(
    @Query() col?: string,
      @Query() dir?: 'ASC' | 'DESC',
      @Query() skip?: number,
      @Query() take?: number,
      @Query() search?: string,
  ): Promise<CompanyListResponse> {
    const lp: ListParams = { skip, take, search };
    if (col && dir) { lp.sorting = { column: col, direction: dir }; }
    return new CompanyService().getAllCompanies(lp);
  }

  /**
   * getCompanySummaries() - retrieve a list of all companies
   * as compact as possible. Used for display of references and options
   */
  @Get('compact')
  public async getCompanySummaries(): Promise<CompanySummary[]> {
    return new CompanyService().getCompanySummaries();
  }

  /**
   * getCompany() - retrieve single company
   * @param id ID of company to retrieve
   */
  @Get('{id}')
  public async getCompany(id: number): Promise<Company> {
    return new CompanyService().getCompany(id);
  }

  /**
   * createCompany() - create company
   * @param params Parameters to create company with
   */
  @Post()
  public async createCompany(@Body() params: CompanyParams): Promise<Company> {
    return new CompanyService().createCompany(params);
  }

  /**
   * updateCompany() - update company
   * @param id ID of company to update
   * @param params Update subset of parameter of company
   */
  @Put('{id}')
  public async updateCompany(id: number, @Body() params: Partial<CompanyParams>): Promise<Company> {
    return new CompanyService().updateCompany(id, params);
  }
}
