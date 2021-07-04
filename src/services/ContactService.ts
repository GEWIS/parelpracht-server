import {
  FindConditions, FindManyOptions, getRepository, ILike, In, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Contact } from '../entity/Contact';
import { ContactFunction } from '../entity/enums/ContactFunction';
import { Gender } from '../entity/enums/Gender';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian, cartesianArrays } from '../helpers/filters';

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

    // let conditions: FindConditions<Contact>[] = [];
    //
    // if (params.filters !== undefined) {
    //   // For each filter value, an OR clause is created
    //   const filters = params.filters.map((f) => f.values.map((v) => ({
    //     [f.column]: v,
    //   })));
    //   // Add the clauses to the where object
    //   conditions = conditions.concat(_.flatten(filters));
    // }
    //
    // if (params.search !== undefined && params.search.trim() !== '') {
    //   conditions = cartesian(conditions, [
    //     { firstName: ILike(`%${params.search.trim()}%`) },
    //     { lastNamePreposition: ILike(`%${params.search.trim()}%`) },
    //     { lastName: ILike(`%${params.search.trim()}%`) },
    //     { email: ILike(`%${params.search.trim()}%`) },
    //   ]);
    // }
    // findOptions.where = conditions;

    let conditions: FindConditions<Contact>[] = [];

    if (params.filters !== undefined) {
      const filters: FindConditions<Contact> = {};
      params.filters.forEach((f) => {
        // @ts-ignore
        filters[f.column] = f.values.length !== 1 ? In(f.values) : f.values[0];
      });
      conditions.push(filters);
    }

    if (params.search !== undefined && params.search.trim() !== '') {
      const rawSearches: FindConditions<Contact>[][] = [];
      params.search.trim().split(' ').forEach((searchTerm) => {
        rawSearches.push([
          { firstName: ILike(`%${searchTerm}%`) },
          { lastNamePreposition: ILike(`%${searchTerm}%`) },
          { lastName: ILike(`%${searchTerm}%`) },
          { email: ILike(`%${searchTerm}%`) },
        ]);
      });
      const searches = cartesianArrays(rawSearches);
      if (conditions.length > 0) {
        conditions = cartesian(conditions, searches);
      } else {
        conditions = searches;
      }
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
    return this.repo.find({
      select: ['id', 'firstName', 'lastNamePreposition', 'lastName', 'companyId'],
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
    const contact = await this.repo.findOne(id);
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
