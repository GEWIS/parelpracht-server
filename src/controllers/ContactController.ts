import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query, Security, Response,
} from 'tsoa';
import { Contact } from '../entity/Contact';
import { WrappedApiError } from '../helpers/error';
import ContactService, { ContactListResponse, ContactParams, ContactSummary } from '../services/ContactService';
import { ListParams } from './ListParams';

@Route('contact')
@Tags('Contact')
export class ContactController extends Controller {
  /**
   * getAllContacts() - retrieve multiple contacts
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getAllContacts(
    @Body() lp: ListParams,
  ): Promise<ContactListResponse> {
    return new ContactService().getAllContacts(lp);
  }

  /**
   * getContactSummaries() - retrieve a list of all contacts
   * as compact as possible. Used for display of references and options
   */
  @Get('compact')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getContactSummaries(): Promise<ContactSummary[]> {
    return new ContactService().getContactSummaries();
  }

  /**
   * getContact() - retrieve single contact
   * @param id ID of contact to retrieve
   */
  @Get('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getContact(id: number): Promise<Contact> {
    return new ContactService().getContact(id);
  }

  /**
   * createContact() - create contact
   * @param params Parameters to create contact with
   */
  @Post()
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async createContact(@Body() params: ContactParams): Promise<Contact> {
    return new ContactService().createContact(params);
  }

  /**
   * updateContact() - update contact
   * @param id ID of contact to update
   * @param params Update subset of parameter of contact
   */
  @Put('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateContact(
    id: number, @Body() params: Partial<ContactParams>,
  ): Promise<Contact> {
    return new ContactService().updateContact(id, params);
  }
}
