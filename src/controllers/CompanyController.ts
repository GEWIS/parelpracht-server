import {
  Body, Tags,
  Controller, Post, Route, Put, Get,
} from 'tsoa';
import { Company } from '../entity/Company';
import CompanyService, { CompanyParams } from '../services/CompanyService';

@Route('company')
@Tags('Company')
export class CompanyController extends Controller {
  @Get()
  public async getCompanies(): Promise<Company[]> {
    return new CompanyService().getAll();
  }

  @Get('{id}')
  public async getCompany(id: number): Promise<Company> {
    return new CompanyService().get(id);
  }

  @Post()
  public async createCompany(@Body() params: CompanyParams): Promise<Company> {
    return new CompanyService().create(params);
  }

  @Put('{id}')
  public async updateCompany(id: number, @Body() params: Partial<CompanyParams>): Promise<Company> {
    return new CompanyService().update(id, params);
  }
}
