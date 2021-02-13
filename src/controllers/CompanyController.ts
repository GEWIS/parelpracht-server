import {
  Body,
  Tags, Controller, Post, Route, Put, Get, Query, Security, Response, Delete, Request,
} from 'tsoa';
import express from 'express';
import { body } from 'express-validator';
import { Company } from '../entity/Company';
import { Invoice } from '../entity/Invoice';
import { Contact } from '../entity/Contact';
import { WrappedApiError } from '../helpers/error';
import CompanyService, { CompanyListResponse, CompanyParams, CompanySummary } from '../services/CompanyService';
import { ListParams } from './ListParams';
import ActivityService, {
  ActivityParams,
  FullActivityParams,
} from '../services/ActivityService';
import BaseActivity from '../entity/activity/BaseActivity';
import { CompanyActivity } from '../entity/activity/CompanyActivity';
import { User } from '../entity/User';
import { validate, validateActivityParams, validateFileParams } from '../helpers/validation';
import InvoiceService from '../services/InvoiceService';
import ContractService from '../services/ContractService';
import { CompanyStatus } from '../entity/enums/CompanyStatus';
import { ActivityType } from '../entity/enums/ActivityType';
import FileService, { FileParams } from '../services/FileService';
import FileHelper from '../helpers/fileHelper';
import BaseFile from '../entity/file/BaseFile';
import { CompanyFile } from '../entity/file/CompanyFile';

@Route('company')
@Tags('Company')
export class CompanyController extends Controller {
  private async validateCompanyParams(req: express.Request): Promise<void> {
    await validate([
      body('name').notEmpty().trim(),
      body('comments').trim(),
      body('phoneNumber').optional({ checkFalsy: true }).isMobilePhone('any').trim(),
      body('addressStreet').notEmpty().trim(),
      body('addressPostalCode').notEmpty().trim(),
      body('addressCity').notEmpty().trim(),
      body('addressCountry').notEmpty().trim(),
      body('invoiceAddressStreet').trim(),
      body('invoiceAddressPostalCode').trim(),
      body('invoiceAddressCity').trim(),
      body('invoiceAddressCountry').trim(),
      body('status').optional().isIn(Object.values(CompanyStatus)),
      body('endDate').optional({ checkFalsy: true }).isDate(),
    ], req);
  }

  /**
   * getAllCompanies() - retrieve multiple companies
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getAllCompanies(
    @Body() lp: ListParams,
  ): Promise<CompanyListResponse> {
    return new CompanyService().getAllCompanies(lp);
  }

  /**
   * getCompanySummaries() - retrieve a list of all companies
   * as compact as possible. Used for display of references and options
   */
  @Get('compact')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getCompanySummaries(): Promise<CompanySummary[]> {
    return new CompanyService().getCompanySummaries();
  }

  /**
   * getAllCompaniesExtensive() - retrieve multiple contracts
   * @param lp List parameters to sort and filter the list
   */
  @Post('extensive')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getAllContractsExtensive(
    @Body() lp: ListParams,
  ): Promise<any> {
    return new ContractService().getAllContractsExtensive(lp);
  }

  /**
   * getCompany() - retrieve single company
   * @param id ID of company to retrieve
   */
  @Get('{id}')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getCompany(id: number): Promise<Company> {
    return new CompanyService().getCompany(id);
  }

  /**
   * createCompany() - create company
   * @param params Parameters to create company with
   * @param req Express.js request object
   */
  @Post()
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async createCompany(
    @Body() params: CompanyParams, @Request() req: express.Request,
  ): Promise<Company> {
    await this.validateCompanyParams(req);
    return new CompanyService().createCompany(params);
  }

  /**
   * updateCompany() - update company
   * @param id ID of company to update
   * @param params Update subset of parameter of company
   * @param req Express.js request object
   */
  @Put('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateCompany(
    id: number, @Body() params: Partial<CompanyParams>, @Request() req: express.Request,
  ): Promise<Company> {
    await this.validateCompanyParams(req);
    return new CompanyService().updateCompany(id, params);
  }

  /**
   * Delete company
   * @param id ID of the company to delete
   * @param req Express.js request object
   */
  @Delete('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteCompany(
    id: number, @Request() req: express.Request,
  ): Promise<void> {
    return new CompanyService().deleteCompany(id);
  }

  /**
   * getUnresolvedInvoices() - retrieve unresolved invoices from company
   * @param id ID of company to retrieve unresolved invoices for
   */
  @Get('{id}/invoices')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getUnresolvedInvoices(id: number): Promise<Invoice[]> {
    return new InvoiceService().getOpenInvoicesByCompany(id);
  }

  /**
   * getContacts() - retrieve contacts from company
   * @param id ID of company to retrieve unresolved invoices for
   */
  @Get('{id}/contacts')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getContacts(id: number): Promise<Contact[]> {
    return new CompanyService().getContacts(id);
  }

  /**
   * Upload a file to a company
   * @param id Id of the company
   * @param req Express.js request object
   */
  @Post('{id}/file/upload')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async uploadProductFile(
    id: number, @Request() req: express.Request,
  ): Promise<CompanyFile> {
    return new FileService(CompanyFile, { actor: req.user as User }).uploadFile(req, id);
  }

  /**
   * Get a saved file from a company
   * @param id ID of the company
   * @param fileId ID of the file
   * @return The requested file as download
   */
  @Get('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getProductFile(id: number, fileId: number): Promise<any> {
    const file = <CompanyFile>(await new FileService(CompanyFile).getFile(id, fileId));

    return FileHelper.putFileInResponse(this, file);
  }

  /**
   * Change the attributes of a file
   * @param id ID of the company
   * @param fileId ID of the file
   * @param params Update subset of the parameters of the file
   * @param req Express.js request object
   */
  @Put('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateProductFile(
    id: number, fileId: number, @Body() params: Partial<FileParams>,
    @Request() req: express.Request,
  ): Promise<BaseFile> {
    await validateFileParams(req);
    return new FileService(CompanyFile).updateFile(id, fileId, params);
  }

  /**
   * Delete a file from the system
   * @param id ID of the company
   * @param fileId ID of the file
   */
  @Delete('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteProductFile(id: number, fileId: number): Promise<void> {
    return new FileService(CompanyFile).deleteFile(id, fileId, true);
  }

  /**
   * Add a activity comment to this company
   * @param id ID of the company
   * @param params Parameters to create this comment with
   * @param req Express.js request object
   */
  @Post('{id}/comment')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addCompanyComment(
    id: number, @Body() params: ActivityParams, @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateActivityParams(req);
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.COMMENT,
    } as FullActivityParams;
    return new ActivityService(CompanyActivity, { actor: req.user as User })
      .createActivity(p);
  }

  /**
   * @param id ID of the company
   * @param activityId ID of the comment activity
   * @param params Update subset of parameter of comment activity
   * @param req Express.js request object
   */
  @Put('{id}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateCompanyActivity(
    id: number, activityId: number, @Body() params: Partial<ActivityParams>,
    @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateActivityParams(req);
    return new ActivityService(CompanyActivity).updateActivity(id, activityId, params);
  }

  /**
   * @param id ID of the company
   * @param activityId ID of the comment activity
   */
  @Delete('{id}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteCompanyActivity(id: number, activityId: number): Promise<void> {
    return new ActivityService(CompanyActivity).deleteActivity(id, activityId);
  }
}
