import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query,
} from 'tsoa';
import { Invoice } from '../entity/Invoice';
import InvoiceService, { InvoiceListResponse, InvoiceParams } from '../services/InvoiceService';
import { ListParams } from './ListParams';

@Route('invoice')
@Tags('Invoice')
export class InvoiceController extends Controller {
  /**
   * getAllInVoices() - retrieve multiple Invoices
   * @param col Sorted column
   * @param dir Sorting direction
   * @param skip Number of elements to skip
   * @param take Amount of elements to request
   * @param search String to filter on value of select columns
   */
  @Get()
  public async getAllInvoices(
    @Query() col?: string,
      @Query() dir?: 'ASC' | 'DESC',
      @Query() skip?: number,
      @Query() take?: number,
      @Query() search?: string,
  ): Promise<InvoiceListResponse> {
    const lp: ListParams = { skip, take, search };
    if (col && dir) { lp.sorting = { column: col, direction: dir }; }
    return new InvoiceService().getAllInvoices(lp);
  }

  /**
   * getInvoice() - retrieve single invoice
   * @param id ID of invoice to retrieve
   */
  @Get('{id}')
  public async getInvoice(id: number): Promise<Invoice> {
    return new InvoiceService().getInvoice(id);
  }

  /**
   * createInvoice() - create invoice
   * @param params Parameters to create invoice with
   */
  @Post()
  public async createInvoice(@Body() params: InvoiceParams): Promise<Invoice> {
    return new InvoiceService().createInvoice(params);
  }

  /**
   * updateInvoice() - update invoice
   * @param id ID of invoice to update
   * @param params Update subset of parameter of invoice
   */
  @Put('{id}')
  public async updateInvoice(
    id: number, @Body() params: Partial<InvoiceParams>,
  ): Promise<Invoice> {
    return new InvoiceService().updateInvoice(id, params);
  }
}
