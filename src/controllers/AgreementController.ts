import {
  Body,
  Controller, Post, Route, Put, Get,
} from 'tsoa';
import { Agreement } from '../entity/Agreement';
import AgreementService, { AgreementParams } from '../services/AgreementService';

@Route('agreement')
export class AgreementController extends Controller {
  @Get('{id}')
  public async getAgreement(id: number): Promise<Agreement> {
    return new AgreementService().get(id);
  }

  @Post()
  public async createAgreement(@Body() params: AgreementParams): Promise<Agreement> {
    return new AgreementService().create(params);
  }

  @Put('{id}')
  public async updateAgreement(
    id: number, @Body() params: Partial<AgreementParams>,
  ): Promise<Agreement> {
    return new AgreementService().update(id, params);
  }
}
