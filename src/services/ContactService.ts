import _ from 'lodash';
import {
  FindConditions,
  FindManyOptions, getRepository, ILike, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Contact, ContactFunction } from '../entity/Contact';
import { Gender } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian } from '../helpers/filters';

// May not be correct yet
export interface ContactParams {
  gender: Gender;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  telephone?: string;
  comments?: string;
  companyId: number;
  function: ContactFunction;
}

export interface ContactSummary {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  companyName: string;
}

export interface ContactListResponse {
  list: Contact[];
  count: number;
}

export default class ContactService {
  repo: Repository<Contact>;

  constructor() {
    this.repo = getRepository(Contact);
  }

  async getContact(id: number): Promise<Contact> {
    const contact = await this.repo.findOne(id, { relations: ['company', 'contracts'] }); // May need more relations
    if (contact === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Contact not found');
    }
    return contact;
  }

  async getAllContacts(params: ListParams): Promise<ContactListResponse> {
    const findOptions: FindManyOptions<Contact> = {
      order: {
        [params.sorting?.column ?? 'id']:
        params.sorting?.direction ?? 'ASC',
      },
    };

    let conditions: FindConditions<Contact>[] = [];

    if (params.filters !== undefined) {
      // For each filter value, an OR clause is created
      const filters = params.filters.map((f) => f.values.map((v) => ({
        [f.column]: v,
      })));
      // Add the clauses to the where object
      conditions = conditions.concat(_.flatten(filters));
    }

    if (params.search !== undefined && params.search.trim() !== '') {
      conditions = cartesian(conditions, [
        { firstName: ILike(`%${params.search.trim()}%`) },
        { middleName: ILike(`%${params.search.trim()}%`) },
        { lastName: ILike(`%${params.search.trim()}%`) },
        { email: ILike(`%${params.search.trim()}%`) },
      ]);
    }
    findOptions.where = conditions;

    return {
      list: await this.repo.find({
        ...findOptions,
        skip: params.skip,
        take: params.take,
      }),
      count: await this.repo.count(findOptions),
    };
  }

  async getContactSummaries(): Promise<ContactSummary[]> {
    const contacts = await this.repo.find({
      select: ['id', 'firstName', 'middleName', 'lastName'],
      relations: ['company'],
    });
    return contacts.map((x) => ({
      companyName: x.company.name,
      ...x,
    }));
  }

  async createContact(params: ContactParams): Promise<Contact> {
    const contact = {
      ...params,
    } as any as Contact;
    return this.repo.save(contact);
  }

  async updateContact(id: number, params: Partial<ContactParams>): Promise<Contact> {
    await this.repo.update(id, params);
    const contact = await this.repo.findOne(id);
    return contact!;
  }
}
