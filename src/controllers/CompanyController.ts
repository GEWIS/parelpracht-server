import {
  Body,
  Tags, Controller, Post, Route, Put, Get, Query,
} from 'tsoa';
import { Company } from '../entity/Company';
import CompanyService, { CompanyListResponse, CompanyParams } from '../services/CompanyService';
import { ListParams } from './ListParams';

@Route('company')
@Tags('Company')
export class CompanyController extends Controller {
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

  @Get('{id}')
  public async getCompany(id: number): Promise<Company> {
    return new CompanyService().getCompany(id);
  }

  @Post()
  public async createCompany(@Body() params: CompanyParams): Promise<Company> {
    return new CompanyService().createCompany(params);
  }

  @Put('{id}')
  public async updateCompany(id: number, @Body() params: Partial<CompanyParams>): Promise<Company> {
    return new CompanyService().updateCompany(id, params);
  }
}
