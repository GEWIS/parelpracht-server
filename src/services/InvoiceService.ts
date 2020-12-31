import {
  FindManyOptions, getRepository, ILike, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Invoice } from '../entity/Invoice';
import { ProductInstance } from '../entity/ProductInstance';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
// eslint-disable-next-line import/no-cycle
import ProductInstanceService from './ProductInstanceService';
// eslint-disable-next-line import/no-cycle
import ActivityService, { FullActivityParams } from './ActivityService';
import { ActivityType } from '../entity/activity/BaseActivity';
import { InvoiceActivity, InvoiceStatus } from '../entity/activity/InvoiceActivity';

// Not correct yet
export interface InvoiceParams {
  companyId: number;
  productInstanceIds: number[],
  poNumber?: string;
  comments?: string;
  assignedToId?: number;
}

export interface InvoiceSummary {
  id: number;
  companyName: string;
}

export interface InvoiceListResponse {
  list: Invoice[];
  count: number;
}

export default class InvoiceService {
  repo: Repository<Invoice>;

  actor?: User;

  constructor(options?: {actor?: User}) {
    this.repo = getRepository(Invoice);
    this.actor = options?.actor;
  }

  async getInvoice(id: number, relations: string[] = []): Promise<Invoice> {
    const invoice = await this.repo.findOne(id, { relations: ['products', 'activities', 'company', 'files', 'files.createdBy'].concat(relations) });
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

    if (params.search !== undefined && params.search.trim() !== '') {
      findOptions.where = [
        { text: ILike(`%${params.search.trim()}%`) },
        // To add: ID
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

  async getInvoiceSummaries(): Promise<InvoiceSummary[]> {
    const invoices = await this.repo.find({
      select: ['id'],
      relations: ['company'],
    });
    return invoices.map((x) => ({
      companyName: x.company.name,
      ...x,
    }));
  }

  async createInvoice(params: InvoiceParams): Promise<Invoice> {
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

    let invoice = this.repo.create({
      ...params,
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
}
