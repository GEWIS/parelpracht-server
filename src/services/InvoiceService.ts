import _ from 'lodash';
import {
  FindConditions, FindManyOptions, getRepository, ILike, In, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Invoice } from '../entity/Invoice';
import { ProductInstance } from '../entity/ProductInstance';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian, cartesianArrays } from '../helpers/filters';
// eslint-disable-next-line import/no-cycle
import ProductInstanceService from './ProductInstanceService';
// eslint-disable-next-line import/no-cycle
import ActivityService, { FullActivityParams } from './ActivityService';
import RawQueries, { ExpiredInvoice } from '../helpers/rawQueries';
import { InvoiceActivity } from '../entity/activity/InvoiceActivity';
import { ActivityType } from '../entity/enums/ActivityType';
import { InvoiceStatus } from '../entity/enums/InvoiceStatus';
import ServerSettingsService from './ServerSettingsService';
import { ServerSetting } from '../entity/ServerSetting';

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

export interface InvoiceSummary {
  id: number;
  title: string;
  companyId: number;
  status: InvoiceStatus;
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
        const ids = await RawQueries.getInvoiceIdsByStatus(statusFilterValues);
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
    // TODO: do not return statusDate in the output objects
    return getRepository(InvoiceActivity).createQueryBuilder('a')
      .select(['max(i.id) as id', 'max(i.title) as title', 'max(i.companyId) as "companyId"', 'max(a.subType) as status', 'max(a.createdAt) as "statusDate"'])
      .innerJoin('a.invoice', 'i', 'a.invoiceId = i.id')
      .groupBy('a.invoiceId')
      .where("a.type = 'STATUS'")
      .getRawMany<InvoiceSummary>();
  }

  async getExpiredInvoices(): Promise<ExpiredInvoice[]> {
    return RawQueries.getExpiredInvoices();
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
    await this.repo.update(id, params);
    const invoice = await this.repo.findOne(id);
    return invoice!;
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
    const result = milliseconds ? new Date(milliseconds) : undefined;
    console.log(result);
    return result;
  }

  async setTreasurerLastSeen(): Promise<void> {
    const date = new Date();
    const milliseconds = date.getTime();
    const setting: ServerSetting = {
      name: 'treasurerLastSeen',
      value: milliseconds.toString(),
    };
    await new ServerSettingsService().setSetting(setting);
    console.log(setting);
  }
}
