import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Security, Response, Request, Delete,
} from 'tsoa';
import { body } from 'express-validator';
import express from 'express';
import { Contact } from '../entity/Contact';
import { WrappedApiError } from '../helpers/error';
import ContactService, { ContactListResponse, ContactParams, ContactSummary } from '../services/ContactService';
import { ListParams } from './ListParams';
import { validate } from '../helpers/validation';
import { Gender } from '../entity/enums/Gender';
import { ContactFunction } from '../entity/enums/ContactFunction';

@Route('contact')
@Tags('Contact')
export class ContactController extends Controller {
  private async validateContactParams(req: express.Request) {
    const emailOptionalFunctions = [
      ContactFunction.SIGNATORY_AUTHORIZED,
      ContactFunction.ASSISTING,
      ContactFunction.OLD,
    ];
    await validate([
      body('gender').isIn(Object.values(Gender)),
      body('firstName').optional({ values: 'falsy' }).isString().trim(),
      body('lastNamePreposition').optional({ values: 'falsy' }).isString().trim(),
      body('lastName').notEmpty().trim(),
      body('telephone').optional({ values: 'falsy' }).isMobilePhone('any'),
      body('comments').optional({ values: 'falsy' }).isString().trim(),
      body('companyId').isInt(),
      body('function').isIn(Object.values(ContactFunction)),
      body('email').if(body('function').not().isIn(emailOptionalFunctions)).notEmpty().isEmail().normalizeEmail(),
      body('email').if(body('function').isIn(emailOptionalFunctions)).optional({ values: 'falsy' }).isEmail().normalizeEmail(),
    ], req);
  }

  /**
   * getAllContacts() - retrieve multiple contacts
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
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
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getContactSummaries(): Promise<ContactSummary[]> {
    return new ContactService().getContactSummaries();
  }

  /**
   * getContact() - retrieve single contact
   * @param id ID of contact to retrieve
   */
  @Get('{id}')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getContact(id: number): Promise<Contact> {
    return new ContactService().getContact(id);
  }

  /**
   * createContact() - create contact
   * @param params Parameters to create contact with
   * @param req Express.js request object
   */
  @Post()
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async createContact(
    @Body() params: ContactParams, @Request() req: express.Request,
  ): Promise<Contact> {
    await this.validateContactParams(req);
    return new ContactService().createContact(params);
  }

  /**
   * updateContact() - update contact
   * @param id ID of contact to update
   * @param params Update subset of parameter of contact
   * @param req: express.Request
   */
  @Put('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateContact(
    id: number, @Body() params: Partial<ContactParams>, @Request() req: express.Request,
  ): Promise<Contact> {
    await this.validateContactParams(req);
    return new ContactService().updateContact(id, params);
  }

  /**
   * Delete contact
   * @param id ID of the contact
   * @param req Express.js request object
   */
  @Delete('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteContact(
    id: number,
  ): Promise<void> {
    return new ContactService().deleteContact(id);
  }
}
