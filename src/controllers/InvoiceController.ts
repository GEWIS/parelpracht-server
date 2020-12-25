import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query, Security, Response, Delete,
} from 'tsoa';
import { Invoice } from '../entity/Invoice';
import { WrappedApiError } from '../helpers/error';
import InvoiceService, { InvoiceListResponse, InvoiceParams, InvoiceSummary } from '../services/InvoiceService';
import { ListParams } from './ListParams';
import ActivityService, {
  CommentParams,
  FullActivityParams,
  StatusParams,
  UpdateActivityParams,
} from '../services/ActivityService';
import BaseActivity, { ActivityType } from '../entity/activity/BaseActivity';
import { InvoiceActivity } from '../entity/activity/InvoiceActivity';

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
  @Security('local')
  @Response<WrappedApiError>(401)
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
   * getInvoiceSummaries() - retrieve a list of all invoices
   * as compact as possible. Used for display of references and options
   */
  @Get('compact')
  @Security('local')
  @Response<WrappedApiError>(401)
  public async getInvoiceSummaries(): Promise<InvoiceSummary[]> {
    return new InvoiceService().getInvoiceSummaries();
  }

  /**
   * getInvoice() - retrieve single invoice
   * @param id ID of invoice to retrieve
   */
  @Get('{id}')
  @Security('local')
  @Response<WrappedApiError>(401)
  public async getInvoice(id: number): Promise<Invoice> {
    return new InvoiceService().getInvoice(id);
  }

  /**
   * createInvoice() - create invoice
   * @param params Parameters to create invoice with
   */
  @Post()
  @Security('local')
  @Response<WrappedApiError>(401)
  public async createInvoice(@Body() params: InvoiceParams): Promise<Invoice> {
    return new InvoiceService().createInvoice(params);
  }

  /**
   * updateInvoice() - update invoice
   * @param id ID of invoice to update
   * @param params Update subset of parameter of invoice
   */
  @Put('{id}')
  @Security('local')
  @Response<WrappedApiError>(401)
  public async updateInvoice(
    id: number, @Body() params: Partial<InvoiceParams>,
  ): Promise<Invoice> {
    return new InvoiceService().updateInvoice(id, params);
  }

  /**
   * Add a activity status to this invoice
   * @param id ID of the invoice
   * @param params Parameters to create this status with
   */
  @Post('{id}/status')
  public async addStatus(id: number, @Body() params: StatusParams): Promise<BaseActivity> {
    // eslint-disable-next-line no-param-reassign
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.STATUS,
    } as FullActivityParams;
    return new ActivityService(InvoiceActivity).createActivity(p);
  }

  /**
   * Add a activity comment to this invoice
   * @param id ID of the invoice
   * @param params Parameters to create this comment with
   */
  @Post('{id}/comment')
  public async addComment(id: number, @Body() params: CommentParams): Promise<BaseActivity> {
    // eslint-disable-next-line no-param-reassign
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.COMMENT,
    } as FullActivityParams;
    return new ActivityService(InvoiceActivity).createActivity(p);
  }

  /**
   * Edit the description and/or related invoice of an activity
   * @param id ID of the invoice
   * @param activityId ID of the activity
   * @param params Update subset of parameter of the activity
   */
  @Put('{id}/activity/{activityId}')
  public async updateActivity(
    id: number, activityId: number, @Body() params: Partial<UpdateActivityParams>,
  ): Promise<BaseActivity> {
    return new ActivityService(InvoiceActivity).updateActivity(id, activityId, params);
  }

  /**
   * Delete an activity
   * @param id ID of the invoice
   * @param activityId ID of the activity
   */
  @Delete('{id}/activity/{activityId}')
  public async deleteActivity(id: number, activityId: number): Promise<void> {
    return new ActivityService(InvoiceActivity).deleteActivity(id, activityId);
  }
}
