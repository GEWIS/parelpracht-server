import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query, Delete,
} from 'tsoa';
import { Invoice } from '../entity/Invoice';
import InvoiceService, { InvoiceListResponse, InvoiceParams } from '../services/InvoiceService';
import { ListParams } from './ListParams';
import ActivityService, {
  CommentParams,
  FullActivityParams,
  StatusParams,
  UpdateActivityParams,
} from '../services/ActivityService';
import BaseActivity, { ActivityType } from '../entity/activity/BaseActivity';
import { InvoiceActivity } from '../entity/activity/InvoiceActivity';
import ProductInstanceService from '../services/ProductInstanceService';
import { ProductInstance } from '../entity/ProductInstance';

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

  /**
   * Add product to an invoice
   * @param id - ID of the invoice
   * @param params - Create subset of product
   */
  @Post('{id}/product')
  public async addProduct(id: number, @Body() params: { productId: number }): Promise<ProductInstance> {
    return new ProductInstanceService().addInvoiceProduct(id, params.productId);
  }

  /**
   * Remove product from an invoice
   * @param id ID of the invoice
   * @param prodId ID of the product instance
   */
  @Delete('{id}/product/{prodId}')
  public async deleteProduct(id: number, prodId: number): Promise<void> {
    return new ProductInstanceService().deleteInvoiceProduct(id, prodId);
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
  public async updateActivity(id: number, activityId: number, @Body() params: Partial<UpdateActivityParams>): Promise<BaseActivity> {
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
