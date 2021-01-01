import {
  Body,
  Tags, Controller, Post, Route, Put, Get, Query, Security, Response, Delete,
} from 'tsoa';
import { Company } from '../entity/Company';
import { Invoice } from '../entity/Invoice';
import { Contact } from '../entity/Contact';
import { WrappedApiError } from '../helpers/error';
import CompanyService, { CompanyListResponse, CompanyParams, CompanySummary } from '../services/CompanyService';
import { ListParams } from './ListParams';
import ActivityService, {
  CommentParams,
  FullActivityParams,
  StatusParams,
  UpdateActivityParams,
} from '../services/ActivityService';
import BaseActivity, { ActivityType } from '../entity/activity/BaseActivity';
import { CompanyActivity } from '../entity/activity/CompanyActivity';

@Route('company')
@Tags('Company')
export class CompanyController extends Controller {
  /**
   * getAllCompanies() - retrieve multiple companies
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['GENERAL', 'ADMIN'])
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
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getCompanySummaries(): Promise<CompanySummary[]> {
    return new CompanyService().getCompanySummaries();
  }

  /**
   * getCompany() - retrieve single company
   * @param id ID of company to retrieve
   */
  @Get('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getCompany(id: number): Promise<Company> {
    return new CompanyService().getCompany(id);
  }

  /**
   * createCompany() - create company
   * @param params Parameters to create company with
   */
  @Post()
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async createCompany(@Body() params: CompanyParams): Promise<Company> {
    return new CompanyService().createCompany(params);
  }

  /**
   * updateCompany() - update company
   * @param id ID of company to update
   * @param params Update subset of parameter of company
   */
  @Put('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateCompany(id: number, @Body() params: Partial<CompanyParams>): Promise<Company> {
    return new CompanyService().updateCompany(id, params);
  }

  /**
   * Add a activity status to this company
   * @param id ID of the company
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
    return new ActivityService(CompanyActivity).createActivity(p);
  }

  /**
   * Add a activity comment to this company
   * @param id ID of the company
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
    return new ActivityService(CompanyActivity).createActivity(p);
  }

  /**
   * @param id ID of the company
   * @param activityId ID of the comment activity
   * @param params Update subset of parameter of comment activity
   */
  @Put('{id}/activity/{activityId}')
  public async updateActivity(
    id: number, activityId: number, @Body() params: Partial<UpdateActivityParams>,
  ): Promise<BaseActivity> {
    return new ActivityService(CompanyActivity).updateActivity(id, activityId, params);
  }

  /**
   * @param id ID of the company
   * @param activityId ID of the comment activity
   */
  @Delete('{id}/activity/{activityId}')
  public async deleteActivity(id: number, activityId: number): Promise<void> {
    return new ActivityService(CompanyActivity).deleteActivity(id, activityId);
  }

  /**
   * getUnresolvedInvoices() - retrieve unresolved invoices from company
   * @param id ID of company to retrieve unresolved invoices for
   */
  @Get('company/{id}/invoices')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getUnresolvedInvoices(id: number): Promise<Invoice[]> {
    return new CompanyService().getUnresolvedInvoices(id);
  }

  /**
   * getContacts() - retrieve contacts from company
   * @param id ID of company to retrieve unresolved invoices for
   */
  @Get('company/{id}/contacts')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getContacts(id: number): Promise<Contact[]> {
    return new CompanyService().getContacts(id);
  }
}
