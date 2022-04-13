import {
  FindManyOptions, FindOptionsWhere, getRepository, ILike, In, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Contact } from '../entity/Contact';
import { ContactFunction } from '../entity/enums/ContactFunction';
import { Gender } from '../entity/enums/Gender';
import { ApiError, HTTPStatus } from '../helpers/error';
import { addQueryWhereClause, cartesian, cartesianArrays } from '../helpers/filters';

// May not be correct yet
export interface ContactParams {
  gender: Gender;
  firstName?: string;
  lastNamePreposition?: string;
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
  lastNamePreposition: string;
  lastName: string;
  companyId: number;
  function: ContactFunction;
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
    const contact = await this.repo.findOne({ where: { id }, relations: ['company', 'contracts'] }); // May need more relations
    if (contact == null) {
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

    findOptions.where = addQueryWhereClause<Contact>(params, ['firstName', 'lastNamePreposition', 'lastName', 'email']);

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
    return this.repo.find({
      select: ['id', 'firstName', 'lastNamePreposition', 'lastName', 'companyId', 'function'],
    });
  }

  async createContact(params: ContactParams): Promise<Contact> {
    const contact = {
      ...params,
    } as any as Contact;
    return this.repo.save(contact);
  }

  async updateContact(id: number, params: Partial<ContactParams>): Promise<Contact> {
    await this.repo.update(id, params);
    const contact = await this.repo.findOneBy({ id });
    return contact!;
  }

  async deleteContact(id: number) {
    const contact = await this.getContact(id);
    if (contact.contracts.length > 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Contact has contracts');
    }

    await this.repo.delete(contact.id);
  }
}
