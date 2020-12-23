import {
  FindManyOptions, getRepository, Like, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Invoice } from '../entity/Invoice';
import { ProductInstance } from '../entity/ProductInstance';
import { ApiError, HTTPStatus } from '../helpers/error';

// Not correct yet
export interface InvoiceParams {
  companyId: number;
  productInstances: ProductInstance[],
  poNumber?: string;
  comments?: string;
}

export interface InvoiceListResponse {
  list: Invoice[];
  count: number;
}

export default class InvoiceService {
  repo: Repository<Invoice>;

  constructor() {
    this.repo = getRepository(Invoice);
  }

  async getInvoice(id: number): Promise<Invoice> {
    const invoice = await this.repo.findOne(id); // Relations still have to be added
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
        { text: Like(`%${params.search.trim()}%`) },
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

  createInvoice(params: InvoiceParams): Promise<Invoice> {
    const invoice = {
      ...params,
    } as any;
    return this.repo.save(invoice);
  }

  async updateInvoice(id: number, params: Partial<InvoiceParams>): Promise<Invoice> {
    await this.repo.update(id, params);
    const invoice = await this.repo.findOne(id);
    return invoice!;
  }
}
