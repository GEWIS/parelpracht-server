import {
  FindManyOptions, getRepository, Like, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Invoice } from '../entity/Invoice';
import { ProductInstance } from '../entity/ProductInstance';
import { ApiError, HTTPStatus } from '../helpers/error';
// eslint-disable-next-line import/no-cycle
import ProductInstanceService from './ProductInstanceService';

// Not correct yet
export interface InvoiceParams {
  companyId: number;
  productInstanceIds: number[],
  poNumber?: string;
  comments?: string;
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

  constructor() {
    this.repo = getRepository(Invoice);
  }

  async getInvoice(id: number): Promise<Invoice> {
    const invoice = await this.repo.findOne(id, { relations: ['products', 'invoiceActivities', 'files', 'files.createdBy'] });
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
      console.log(p);
      if (p.contract.companyId !== params.companyId) {
        throw new ApiError(HTTPStatus.BadRequest, 'ProductInstance does not belong to the same company as the invoice');
      }
      products.push(p);
    }));

    console.log(products);

    const invoice = {
      ...params,
      products,
    } as any as Invoice;
    console.log(invoice);
    return this.repo.save(invoice);
  }

  async updateInvoice(id: number, params: Partial<InvoiceParams>): Promise<Invoice> {
    await this.repo.update(id, params);
    const invoice = await this.repo.findOne(id);
    return invoice!;
  }
}
