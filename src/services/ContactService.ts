import {
  FindManyOptions, getRepository, Like, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Contact, ContactFunction } from '../entity/Contact';
import { Gender } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';

// May not be correct yet
export interface ContactParams {
  gender: Gender;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  telephone?: string;
  comments?: string;
  companyId: number;
  function?: ContactFunction;
}

export interface ContactSummary {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
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
    const contact = await this.repo.findOne(id, { relations: ['company'] }); // May need more relations
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

    if (params.search !== undefined && params.search.trim() !== '') {
      findOptions.where = [
        { firstName: Like(`%${params.search.trim()}%`) },
        { middleName: Like(`%${params.search.trim()}%`) },
        { lastName: Like(`%${params.search.trim()}%`) },
        { email: Like(`%${params.search.trim()}%`) },
        /* To add: ID */
      ];
    }

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
    return this.repo.find({ select: ['id', 'firstName', 'middleName', 'lastName'] });
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
