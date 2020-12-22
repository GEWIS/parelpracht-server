import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query,
} from 'tsoa';
import { Contact } from '../entity/Contact';
import ContactService, { ContactListResponse, ContactParams, ContactSummary } from '../services/ContactService';
import { ListParams } from './ListParams';

@Route('contact')
@Tags('Contact')
export class ContactController extends Controller {
  /**
   * getAllCompanies() - retrieve multiple contacts
   * @param col Sorted column
   * @param dir Sorting direction
   * @param skip Number of elements to skip
   * @param take Amount of elements to request
   * @param search String to filter on value of select columns
   */
  @Get()
  public async getAllContacts(
    @Query() col?: string,
      @Query() dir?: 'ASC' | 'DESC',
      @Query() skip?: number,
      @Query() take?: number,
      @Query() search?: string,
  ): Promise<ContactListResponse> {
    const lp: ListParams = { skip, take, search };
    if (col && dir) { lp.sorting = { column: col, direction: dir }; }
    return new ContactService().getAllContacts(lp);
  }

  /**
   * getContactSummaries() - retrieve a list of all contacts
   * as compact as possible. Used for display of references and options
   */
  @Get('compact')
  public async getContactSummaries(): Promise<ContactSummary[]> {
    return new ContactService().getContactSummaries();
  }

  /**
   * getContact() - retrieve single contact
   * @param id ID of contact to retrieve
   */
  @Get('{id}')
  public async getContact(id: number): Promise<Contact> {
    return new ContactService().getContact(id);
  }

  /**
   * createContact() - create contact
   * @param params Parameters to create contact with
   */
  @Post()
  public async createContact(@Body() params: ContactParams): Promise<Contact> {
    return new ContactService().createContact(params);
  }

  /**
   * updateContact() - update contact
   * @param id ID of contact to update
   * @param params Update subset of parameter of contact
   */
  @Put('{id}')
  public async updateContact(
    id: number, @Body() params: Partial<ContactParams>,
  ): Promise<Contact> {
    return new ContactService().updateContact(id, params);
  }
}
