import { Body, Controller, Post, Route, Put, Tags, Get, Security, Response, Delete, Request } from 'tsoa';
import express from 'express';
import { body, ValidationChain } from 'express-validator';
import { Invoice } from '../entity/Invoice';
import { ApiError, HTTPStatus, WrappedApiError } from '../helpers/error';
import InvoiceService, { InvoiceCreateParams, InvoiceListResponse, InvoiceParams } from '../services/InvoiceService';
import { ListParams } from './ListParams';
import ActivityService, { ActivityParams, FullActivityParams, InvoiceStatusParams } from '../services/ActivityService';
import BaseActivity from '../entity/activity/BaseActivity';
import { InvoiceActivity } from '../entity/activity/InvoiceActivity';
import ProductInstanceService from '../services/ProductInstanceService';
import { ProductInstance } from '../entity/ProductInstance';
import { User } from '../entity/User';
import FileService, { FileParams, FullGenerateInvoiceParams, GenerateInvoiceParams } from '../services/FileService';
import BaseFile from '../entity/file/BaseFile';
import { InvoiceFile } from '../entity/file/InvoiceFile';
import FileHelper from '../helpers/fileHelper';
import { validate, validateActivityParams, validateCommentParams, validateFileParams } from '../helpers/validation';
import { CustomInvoiceGenSettings, ReturnFileType } from '../pdfgenerator/GenSettings';
import { ExpiredInvoice } from '../helpers/rawQueries';
import { ActivityType } from '../entity/enums/ActivityType';
import { Language } from '../entity/enums/Language';
import { InvoiceStatus } from '../entity/enums/InvoiceStatus';
import { InvoiceSummary } from '../entity/Summaries';
import { Roles } from '../entity/enums/Roles';

@Route('invoice')
@Tags('Invoice')
export class InvoiceController extends Controller {
  private async validateInvoiceParams(req: express.Request, validations: ValidationChain[] = []) {
    await validate(
      [
        body('title').isString().trim(),
        body('poNumber').optional({ checkFalsy: true }).isString().trim(),
        body('comments').optional({ checkFalsy: true }).isString().trim(),
        body('startDate').optional({ checkFalsy: true }).isISO8601(),
        body('assignedToId').optional({ checkFalsy: true }).isInt(),
      ].concat(validations),
      req,
    );
  }

  /**
   * getAllInvoices() - retrieve multiple invoices
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getAllInvoices(@Body() lp: ListParams): Promise<InvoiceListResponse> {
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
   * getExpiredInvoices() - retrieve a list of all expired invoices
   */
  @Get('expired')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getExpiredInvoices(): Promise<ExpiredInvoice[]> {
    return new InvoiceService().getExpiredInvoices();
  }

  /**
   * Set the last-seen-date to the current date and time
   */
  @Put('lastseen')
  @Security('local', ['FINANCIAL'])
  @Response<WrappedApiError>(401)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async updateLastSeenByTreasurer(): Promise<void> {
    console.log('run run run!');
    return new InvoiceService().setTreasurerLastSeen();
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
  public async createInvoice(@Request() req: express.Request, @Body() params: InvoiceCreateParams): Promise<Invoice> {
    await this.validateInvoiceParams(req, [body('companyId').isInt(), body('productInstanceIds').isArray()]);
    return new InvoiceService({ actor: req.user as User }).createInvoice(params);
  }

  /**
   * updateInvoice() - update invoice
   * @param id ID of invoice to update
   * @param params Update subset of parameter of invoice
   * @param req Express.js request object
   */
  @Put('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateInvoice(
    id: number,
    @Body() params: Partial<InvoiceParams>,
    @Request() req: express.Request,
  ): Promise<Invoice> {
    await this.validateInvoiceParams(req);
    return new InvoiceService({ actor: req.user as User }).updateInvoice(id, params);
  }

  /**
   * Delete an invoice, if it has no products or updated statuses
   * @param id ID of the invoice
   * @param req Express.js request object
   */
  @Delete('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteInvoice(id: number): Promise<void> {
    return new InvoiceService().deleteInvoice(id);
  }

  /**
   * Add product to an invoice
   * @param id - ID of the invoice
   * @param params - Create subset of product
   * @param req Express.js request object
   */
  @Post('{id}/product')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addProductToInvoice(
    id: number,
    @Body() params: { productId: number },
    @Request() req: express.Request,
  ): Promise<ProductInstance> {
    await validate([body('productId').isInt()], req);
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
  public async deleteProductFromInvoice(id: number, prodId: number): Promise<void> {
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
  public async generateInvoiceFile(
    id: number,
    @Body() params: GenerateInvoiceParams,
    @Request() req: express.Request,
  ): Promise<any> {
    await validate(
      [
        body('language').isIn(Object.values(Language)),
        body('fileType').isIn(Object.values(ReturnFileType)),
        body('showDiscountPercentages').isBoolean(),
        body('saveToDisk').isBoolean(),
        body('recipientId').isInt(),
      ],
      req,
    );
    const file = await new FileService(InvoiceFile, { actor: req.user as User }).generateInvoiceFile({
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
  public async uploadInvoiceFile(id: number, @Request() req: express.Request): Promise<InvoiceFile> {
    const actor = req.user as User;
    if (req.body.createdAt !== undefined && !actor.hasRole(Roles.ADMIN)) {
      throw new ApiError(
        HTTPStatus.Unauthorized,
        "You don't have permission to do this. Only admins can set createdAt.",
      );
    }

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
  public async getInvoiceFile(id: number, fileId: number): Promise<any> {
    const file = <InvoiceFile>await new FileService(InvoiceFile).getFile(id, fileId);

    return FileHelper.putFileInResponse(this, file);
  }

  /**
   * Change the attributes of a file
   * @param id ID of the invoice
   * @param fileId ID of the file
   * @param params Update subset of the parameters of the file
   * @param req Express.js request object
   */
  @Put('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateInvoiceFile(
    id: number,
    fileId: number,
    @Body() params: Partial<FileParams>,
    @Request() req: express.Request,
  ): Promise<BaseFile> {
    await validateFileParams(req);
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
  public async deleteInvoiceFile(id: number, fileId: number): Promise<void> {
    return new FileService(InvoiceFile).deleteFile(id, fileId, true);
  }

  /**
   * Create a custom invoice (e.g. for the treasurer)
   * @param params Parameters to create this custom invoice with
   * @param req Express.js request object
   * @return The requested file as download
   */
  @Post('custom')
  @Security('local', ['FINANCIAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async generateCustomInvoice(
    @Body() params: CustomInvoiceGenSettings,
    @Request() req: express.Request,
  ): Promise<any> {
    await validate(
      [
        body('language').isIn(Object.values(Language)),
        body('fileType').isIn(Object.values(ReturnFileType)),
        body('subject').isString().trim(),
        body('ourReference').isString().trim(),
        body('theirReference').optional({ checkFalsy: true }).isString().trim(),
      ],
      req,
    );
    const file = await FileService.generateCustomInvoice(params, req.user as User);

    return FileHelper.putFileInResponse(this, file);
  }

  /**
   * Add a activity status to this invoice
   * @param id ID of the invoice
   * @param params Parameters to create this status with
   * @param req Express.js request object
   */
  @Post('{id}/status')
  @Security('local', ['GENERAL', 'ADMIN', 'FINANCIAL'])
  @Response<WrappedApiError>(401)
  public async addInvoiceStatus(
    id: number,
    @Body() params: InvoiceStatusParams,
    @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateActivityParams(req, [body('subType').isIn(Object.values(InvoiceStatus))]);
    const p: FullActivityParams = {
      descriptionDutch: params.description,
      descriptionEnglish: params.description,
      subType: params.subType,
      entityId: id,
      type: ActivityType.STATUS,
    };
    return new ActivityService(new InvoiceActivity(), { actor: req.user as User }).createActivity(InvoiceActivity, p);
  }

  /**
   * Add a activity comment to this invoice
   * @param id ID of the invoice
   * @param params Parameters to create this comment with
   * @param req Express.js request object
   */
  @Post('{id}/comment')
  @Security('local', ['GENERAL', 'ADMIN', 'FINANCIAL'])
  @Response<WrappedApiError>(401)
  public async addInvoiceComment(
    id: number,
    @Body() params: ActivityParams,
    @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateCommentParams(req);
    const p: FullActivityParams = {
      descriptionDutch: params.description,
      descriptionEnglish: params.description,
      entityId: id,
      type: ActivityType.COMMENT,
    };
    return new ActivityService(new InvoiceActivity(), { actor: req.user as User }).createActivity(InvoiceActivity, p);
  }

  /**
   * Edit the description and/or related invoice of an activity
   * @param id ID of the invoice
   * @param activityId ID of the activity
   * @param params Update subset of parameter of the activity
   * @param req Express.js request object
   */
  @Put('{id}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateInvoiceActivity(
    id: number,
    activityId: number,
    @Body() params: Partial<ActivityParams>,
    @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateActivityParams(req);
    const p: Partial<FullActivityParams> = {
      descriptionDutch: params.description,
      descriptionEnglish: params.description,
    };
    return new ActivityService(new InvoiceActivity()).updateActivity(id, activityId, p);
  }
}
