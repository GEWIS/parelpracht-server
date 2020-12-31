import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query, Security, Response, Delete, Request,
} from 'tsoa';
import express from 'express';
import { Invoice } from '../entity/Invoice';
import { WrappedApiError } from '../helpers/error';
import InvoiceService, { InvoiceListResponse, InvoiceParams, InvoiceSummary } from '../services/InvoiceService';
import { ListParams } from './ListParams';
import ActivityService, {
  ActivityParams,
  FullActivityParams,
  StatusParams,
} from '../services/ActivityService';
import BaseActivity, { ActivityType } from '../entity/activity/BaseActivity';
import { InvoiceActivity } from '../entity/activity/InvoiceActivity';
import ProductInstanceService from '../services/ProductInstanceService';
import { ProductInstance } from '../entity/ProductInstance';
import { User } from '../entity/User';
import FileService, {
  FileParams,
  FullGenerateInvoiceParams, GenerateInvoiceParams,
} from '../services/FileService';
import BaseFile from '../entity/file/BaseFile';
import { InvoiceFile } from '../entity/file/InvoiceFile';
import FileHelper from '../helpers/fileHelper';

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
  @Security('local', ['FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
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
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getInvoiceSummaries(): Promise<InvoiceSummary[]> {
    return new InvoiceService().getInvoiceSummaries();
  }

  /**
   * getInvoice() - retrieve single invoice
   * @param id ID of invoice to retrieve
   */
  @Get('{id}')
  @Security('local', ['FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getInvoice(id: number): Promise<Invoice> {
    return new InvoiceService().getInvoice(id);
  }

  /**
   * createInvoice() - create invoice
   * @param req Express.js request object
   * @param params Parameters to create invoice with
   */
  @Post()
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async createInvoice(
    @Request() req: express.Request,
      @Body() params: InvoiceParams,
  ): Promise<Invoice> {
    return new InvoiceService({ actor: req.user as User }).createInvoice(params);
  }

  /**
   * updateInvoice() - update invoice
   * @param id ID of invoice to update
   * @param params Update subset of parameter of invoice
   */
  @Put('{id}')
  @Security('local', ['FINANCIAL', 'GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
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
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addProduct(
    id: number, @Body() params: { productId: number },
  ): Promise<ProductInstance> {
    return new ProductInstanceService().addInvoiceProduct(id, params.productId);
  }

  /**
   * Remove product from an invoice
   * @param id ID of the invoice
   * @param prodId ID of the product instance
   */
  @Delete('{id}/product/{prodId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteProduct(id: number, prodId: number): Promise<void> {
    return new ProductInstanceService().deleteInvoiceProduct(id, prodId);
  }

  /**
   * Create a new PDF file for this invoice
   * @param id ID of the invoice
   * @param params Parameters to create this file with
   * @param req Express.js request object
   * @return The requested file as download
   */
  @Post('{id}/file/generate')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async generateFile(
    id: number, @Body() params: GenerateInvoiceParams, @Request() req: express.Request,
  ): Promise<any> {
    const file = await new FileService(InvoiceFile, { actor: req.user as User })
      .generateInvoiceFile({
        ...params,
        entityId: id,
      } as FullGenerateInvoiceParams);

    return FileHelper.putFileInResponse(this, file);
  }

  /**
   * Upload a file to a invoice
   * @param id Id of the invoice
   * @param req Express.js request object
   */
  @Post('{id}/file/upload')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async uploadFile(id: number, @Request() req: express.Request): Promise<InvoiceFile> {
    return new FileService(InvoiceFile, { actor: req.user as User }).uploadFile(req, id);
  }

  /**
   * Get a saved file from an invoice
   * @param id ID of the invoice
   * @param fileId ID of the file
   * @return The requested file as download
   */
  @Get('{id}/file/{fileId}')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getFile(id: number, fileId: number): Promise<any> {
    const file = <InvoiceFile>(await new FileService(InvoiceFile).getFile(id, fileId));

    return FileHelper.putFileInResponse(this, file);
  }

  /**
   * Change the attributes of a file
   * @param id ID of the invoice
   * @param fileId ID of the file
   * @param params Update subset of the parameters of the file
   */
  @Put('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateFile(
    id: number, fileId: number, @Body() params: Partial<FileParams>,
  ): Promise<BaseFile> {
    return new FileService(InvoiceFile).updateFile(id, fileId, params);
  }

  /**
   * Delete a file from the system
   * @param id ID of the invoice
   * @param fileId ID of the file
   */
  @Delete('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteFile(id: number, fileId: number): Promise<void> {
    return new FileService(InvoiceFile).deleteFile(id, fileId, true);
  }

  /**
   * Add a activity status to this invoice
   * @param id ID of the invoice
   * @param params Parameters to create this status with
   * @param req Express.js request object
   */
  @Post('{id}/status')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addStatus(
    id: number, @Body() params: StatusParams, @Request() req: express.Request,
  ): Promise<BaseActivity> {
    // eslint-disable-next-line no-param-reassign
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.STATUS,
    } as FullActivityParams;
    return new ActivityService(InvoiceActivity, { actor: req.user as User }).createActivity(p);
  }

  /**
   * Add a activity comment to this invoice
   * @param id ID of the invoice
   * @param params Parameters to create this comment with
   * @param req Express.js request object
   */
  @Post('{id}/comment')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addComment(
    id: number, @Body() params: ActivityParams, @Request() req: express.Request,
  ): Promise<BaseActivity> {
    // eslint-disable-next-line no-param-reassign
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.COMMENT,
    } as FullActivityParams;
    return new ActivityService(InvoiceActivity, { actor: req.user as User }).createActivity(p);
  }

  /**
   * Edit the description and/or related invoice of an activity
   * @param id ID of the invoice
   * @param activityId ID of the activity
   * @param params Update subset of parameter of the activity
   */
  @Put('{id}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateActivity(
    id: number, activityId: number, @Body() params: Partial<ActivityParams>,
  ): Promise<BaseActivity> {
    return new ActivityService(InvoiceActivity).updateActivity(id, activityId, params);
  }

  /**
   * Delete an activity
   * @param id ID of the invoice
   * @param activityId ID of the activity
   */
  @Delete('{id}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteActivity(id: number, activityId: number): Promise<void> {
    return new ActivityService(InvoiceActivity).deleteActivity(id, activityId);
  }
}
