import {
  Body,
  Controller, Post, Route, Put,
} from 'tsoa';
import { Company } from '../entity/Company';
import CompanyService, { CompanyParams } from '../services/CompanyService';

@Route('company')
export class CompanyController extends Controller {
  @Post()
  public async createCompany(@Body() params: CompanyParams): Promise<Company> {
    return new CompanyService().create(params);
  }

  @Put('{id}')
  public async updateCompany(id: number, @Body() params: Partial<CompanyParams>): Promise<Company> {
    return new CompanyService().update(id, params);
  }
}
