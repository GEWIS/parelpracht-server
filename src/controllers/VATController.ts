import { body } from 'express-validator';
import { Body, Controller, Get, Post, Put, Request, Response, Route, Security, Tags } from 'tsoa';
import VATService, { VATListResponse, VATParams, VATSummary } from '../services/VATService';
import { WrappedApiError } from '../helpers/error';
import { ValueAddedTax } from '../entity/ValueAddedTax';
import { validate } from '../helpers/validation';
import { ExpressRequest } from '../types/express';
import { ListParams } from './ListParams';

@Route('VAT')
@Tags('Value Added Tax')
export class VATController extends Controller {
  private async validateVATParams(req: ExpressRequest) {
    await validate([body('category').notEmpty().trim()], req);
  }

  /**
   * Get a list of all VAT with the provided filters
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getAllVAT(@Body() lp: ListParams): Promise<VATListResponse> {
    return new VATService().getAllVAT(lp);
  }

  /**
   * Retrieve a list of all VAT as compact as possible.
   * Used for display of references and options
   */
  @Get('compact')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT', 'SIGNEE', 'FINANCIAL'])
  @Response<WrappedApiError>(401)
  public async getVATSummaries(): Promise<VATSummary[]> {
    return new VATService().getVATSummaries();
  }

  /**
   * Retrieve a single VAT with all their products
   * @param id ID of the VAT
   */
  @Get('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getVAT(id: number): Promise<ValueAddedTax> {
    return new VATService().getVAT(id);
  }

  /**
   * Update a VAT object
   * @param id ID of the VAT
   * @param params Update subset of parameter of VAT
   * @param req Express.js request object
   */
  @Put('{id}')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateVAT(
    id: number,
    @Body() params: Partial<VATParams>,
    @Request() req: ExpressRequest,
  ): Promise<ValueAddedTax> {
    await this.validateVATParams(req);
    return new VATService().updateVAT(id, params);
  }
}
