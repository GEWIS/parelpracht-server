import {
  FindConditions, FindManyOptions, getRepository, ILike, In, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Invoice } from '../entity/Invoice';
import { ProductInstance } from '../entity/ProductInstance';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian, cartesianArrays } from '../helpers/filters';
import ProductInstanceService from './ProductInstanceService';
import ActivityService, { FullActivityParams } from './ActivityService';
import RawQueries, { ExpiredInvoice } from '../helpers/rawQueries';
import { InvoiceActivity } from '../entity/activity/InvoiceActivity';
import { ActivityType } from '../entity/enums/ActivityType';
import { InvoiceStatus } from '../entity/enums/InvoiceStatus';
import ServerSettingsService from './ServerSettingsService';
import { ServerSetting } from '../entity/ServerSetting';
import { InvoiceSummary } from '../entity/Summaries';
import { createActivitiesForEntityEdits } from '../helpers/activity';
import getEntityChanges from '../helpers/entityChanges';

export interface InvoiceParams {
  title: string;
  poNumber?: string;
  comments?: string;
  startDate?: Date;
  assignedToId?: number;
}

export interface InvoiceCreateParams extends InvoiceParams {
  productInstanceIds: number[];
  companyId: number;
}

export interface InvoiceListResponse {
  list: Invoice[];
  count: number;
  lastSeen?: Date;
}

export default class InvoiceService {
  repo: Repository<Invoice>;

  actor?: User;

  constructor(options?: {actor?: User}) {
    this.repo = getRepository(Invoice);
    this.actor = options?.actor;
  }

  async getInvoice(id: number, relations: string[] = []): Promise<Invoice> {
    const invoice = await this.repo.findOne(id, { relations: ['products', 'products.activities', 'activities', 'company', 'files', 'files.createdBy'].concat(relations) });
    if (invoice === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Invoice not found');
    }
    return invoice;
  }

  async getAllInvoices(params: ListParams): Promise<InvoiceListResponse> {
    const findOptions: FindManyOptions<Invoice> = {
      order: {
        [params.sorting?.column ?? 'id']:
        params.sorting?.direction ?? 'ASC',
      },
    };

    let conditions: FindConditions<Invoice>[] = [];

    if (params.filters !== undefined) {
      const filters: FindConditions<Invoice> = {};
      let statusFilterValues: any[] = [];

      params.filters.forEach((f) => {
        if (f.column === 'activityStatus') {
          statusFilterValues = f.values;
        } else {
          // @ts-ignore
          filters[f.column] = f.values.length !== 1 ? In(f.values) : f.values[0];
        }
      });

      if (statusFilterValues.length > 0) {
        const ids = await new RawQueries().getInvoiceIdsByStatus(statusFilterValues);
        // @ts-ignore
        filters.id = In(ids.map((o) => o.id));
      }

      conditions.push(filters);
    }

    if (params.search !== undefined && params.search.trim() !== '') {
      const rawSearches: FindConditions<Invoice>[][] = [];
      params.search.trim().split(' ').forEach((searchTerm) => {
        rawSearches.push([
          { title: ILike(`%${searchTerm}%`) },
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
      lastSeen: await this.getTreasurerLastSeen(),
    };
  }

  async getInvoiceSummaries(): Promise<InvoiceSummary[]> {
    return new RawQueries().getInvoiceSummaries();
  }

  async getExpiredInvoices(): Promise<ExpiredInvoice[]> {
    return new RawQueries().getExpiredInvoices();
  }

  async createInvoice(params: InvoiceCreateParams): Promise<Invoice> {
    const products: ProductInstance[] = [];
    // Convert productInstanceIds to an array of objects
    await Promise.all(params.productInstanceIds.map(async (id) => {
      const p = await new ProductInstanceService().getProduct(id, ['contract']);
      // Verify that the productInstance and invoice share the same company
      if (p.contract.companyId !== params.companyId) {
        throw new ApiError(HTTPStatus.BadRequest, 'ProductInstance does not belong to the same company as the invoice');
      }
      products.push(p);
    }));

    const assignedToId = params.assignedToId ? params.assignedToId : this.actor?.id;
    let invoice = this.repo.create({
      ...params,
      assignedToId,
      products,
      createdById: this.actor?.id,
    });

    invoice = await this.repo.save(invoice);

    await new ActivityService(InvoiceActivity, { actor: this.actor }).createActivity({
      entityId: invoice.id,
      type: ActivityType.STATUS,
      subType: InvoiceStatus.CREATED,
      description: '',
    } as FullActivityParams);

    return this.getInvoice(invoice.id);
  }

  async updateInvoice(id: number, params: Partial<InvoiceParams>): Promise<Invoice> {
    const invoice = await this.getInvoice(id);

    const changes = getEntityChanges(params, invoice);
    if (Object.keys(changes).includes('startDate')) {
      const oldDate = new Date(invoice.startDate.toDateString());
      const newDate = new Date(params.startDate!.toDateString());
      if (newDate.getTime() < oldDate.getTime()) {
        throw new ApiError(HTTPStatus.BadRequest, 'Invoice start date cannot be in the past or before the original start date.');
      }
    }

    if (!(await createActivitiesForEntityEdits<Invoice>(
      this.repo, invoice, params, new ActivityService(InvoiceActivity, { actor: this.actor }),
    ))) return invoice;

    return this.getInvoice(id);
  }

  async deleteInvoice(id: number) {
    const invoice = await this.getInvoice(id);
    if (invoice.products.length > 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Invoice has products');
    }
    if (invoice.activities.filter((a) => a.type === ActivityType.STATUS).length > 1) {
      throw new ApiError(HTTPStatus.BadRequest, 'Invoice has a status other than CREATED');
    }

    await this.repo.delete(invoice.id);
  }

  async getOpenInvoicesByCompany(companyId: number): Promise<Array<Invoice>> {
    const invoices = await this.repo.find({
      where:
        { companyId },
      relations: ['activities'],
    });

    const result: Invoice[] = [];
    invoices.forEach((i) => {
      if (i.activities.length <= 1) result.push(i);
    });
    return result;
  }

  async getTreasurerLastSeen(): Promise<Date | undefined> {
    const setting = await new ServerSettingsService().getSetting('treasurerLastSeen');
    const settingValue = setting?.value;
    const milliseconds = settingValue ? parseInt(settingValue, 10) : undefined;
    return milliseconds ? new Date(milliseconds) : undefined;
  }

  async setTreasurerLastSeen(): Promise<void> {
    const date = new Date();
    const milliseconds = date.getTime();
    const setting: ServerSetting = {
      name: 'treasurerLastSeen',
      value: milliseconds.toString(),
    };
    await new ServerSettingsService().setSetting(setting);
  }

  async transferAssignments(fromUser: User, toUser: User): Promise<void> {
    await this.repo.createQueryBuilder()
      .update()
      .set({ assignedToId: toUser.id })
      .where('assignedToId = :id', { id: fromUser.id })
      .execute();
  }
}
