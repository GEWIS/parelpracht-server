import { getManager } from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { ActivityType } from '../entity/enums/ActivityType';
import { ContractStatus } from '../entity/enums/ContractStatus';
import { InvoiceStatus } from '../entity/enums/InvoiceStatus';
import { ContractSummary, InvoiceSummary } from '../entity/Summaries';
import { ProductInstanceStatus } from '../entity/enums/ProductActivityStatus';
import { currentFinancialYear } from './timestamp';
import { ApiError, HTTPStatus } from './error';

export interface ETCompany {
  id: number,
  name: string,
  contracts: ETContract[],
}

export interface ETContract {
  id: number
  title: string,
  products: ETProductInstance[],
}

export interface ETProductInstance {
  id: number
  productId: number,
  details?: string,
  basePrice: number,
  discount: number,
  createdAt: Date,
  updatedAt: Date,
  subType: ProductInstanceStatus,
  invoiceDate?: Date,
}

export interface RecentContract {
  id: number,
  title: string,
  companyId: number,
  assignedToId: number,
  contactId: number,
  createdAt: Date,
  updatedAt: Date,
  type: ActivityType
  description: string,
  createdById: number,
  subType: ContractStatus;
}

export interface ExpiredInvoice {
  id: number,
  version: number,
  startDate: Date,
  companyId: number,
  assignedToId: number,
  createdAt: Date,
  updatedAt: Date,
  createdById: number,
  value: number,
}

export interface AnalysisResult {
  amount: number,
  nrOfProducts: number,
}

export interface AnalysisResultByYear extends AnalysisResult {
  year: number;
}

export interface ProductsPerCategoryPerPeriod {
  categoryId: number,
  period: number,
  amount: number,
  nrOfProducts: number,
}

interface MegaTableFilters {
  company: string,
  invoice: string,
  status: string,
  product: string,
}

/**
 * Convert a JavaScript array to an SQL array (in a string)
 * @param arr Array to convert
 */
function arrayToQueryArray(arr: string[] | number[]) {
  let result = '(';
  arr.forEach((a: string | number) => {
    if (typeof a === 'string') {
      result += `'${a}', `;
    } else {
      result += `${a}, `;
    }
  });
  return `${result.substring(0, result.length - 2)})`;
}

/*
*   Type and string-checking
*/

function arrayNumberError(array: number[], msg: string) {
  if (array.some((x) => { return Number.isNaN(x); })) {
    throw new ApiError(HTTPStatus.BadRequest, msg);
  }
}

function arrayLetterError(array: string[], msg: string) {
  if (!array.every((x) => { return /^[a-zA-Z]+$/.test(x); })) {
    throw new ApiError(HTTPStatus.BadRequest, msg);
  }
}

function numberError(x: number, msg: string) {
  if (Number.isNaN(x)) {
    throw new ApiError(HTTPStatus.BadRequest, msg);
  }
}

function letterError(x: string, msg: string) {
  if (!/^[a-zA-Z]+$/.test(x)) {
    throw new ApiError(HTTPStatus.BadRequest, msg);
  }
}

/*
*   Year helper functions
*/

function inOrBeforeYearFilter(column: string, year: number): string {
  numberError(year, 'Year is not a number');
  return `EXTRACT(YEAR FROM ${column} + interval '6' month) <= ${year}`;
}

function inYearFilter(column: string, year: number): string {
  numberError(year, 'Year is not a number');
  return `EXTRACT(YEAR FROM ${column} + interval '6' month) = ${year}`;
}

function inYearsFilter(column: string, years: number[]): string {
  arrayNumberError(years, 'Year is not a number');
  return `EXTRACT(YEAR FROM ${column} + interval '6' month) IN ${arrayToQueryArray(years)}`;
}

export default class RawQueries {
  private readonly database: 'mysql' | 'postgres';

  constructor() {
    switch (process.env.TYPEORM_CONNECTION) {
      case 'mariadb':
      case 'mysql':
        this.database = 'mysql';
        break;
      case 'postgres':
        this.database = 'postgres';
        break;
      default:
        throw new Error(`Database type ${process.env.TYPEORM_CONNECTION} is not supported by the raw queries of ParelPracht`);
    }
  }

  private postProcessing(query: string) {
    const q = this.database === 'mysql' ? query.split('"').join('') : query;
    console.log(q);
    return getManager().query(q);
  }

  getContractSummaries = (): Promise<ContractSummary[]> => {
    return this.postProcessing(`
      SELECT c.id, max(c.title) as title, COALESCE(sum(p."basePrice" - p.discount), 0) as value, max(a1."subType") as "status"
      FROM contract c
      JOIN contract_activity a1 ON (c.id = a1."contractId" AND a1.type = 'STATUS')
      LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND a2.type = 'STATUS' AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      LEFT JOIN product_instance p ON (c.id = p."contractId")
      WHERE (a2.id IS NULL)
      GROUP by c.id
    `);
  };

  getInvoiceSummaries = (): Promise<InvoiceSummary[]> => {
    return this.postProcessing(`
      SELECT i.id, max(i.title) as title, max(i."companyId") as "companyId", sum(p."basePrice" - p.discount) as value, max(a1."subType") as "status"
      FROM invoice i
      JOIN invoice_activity a1 ON (i.id = a1."invoiceId" AND a1.type = 'STATUS')
      LEFT OUTER JOIN invoice_activity a2 ON (i.id = a2."invoiceId" AND a2.type = 'STATUS' AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      LEFT JOIN product_instance p ON (i.id = p."invoiceId")
      WHERE (a2.id IS NULL)
      GROUP by i.id
    `);
  };

  private processFilters(lp: ListParams): MegaTableFilters {
    let [company, product, status, invoice] = ['', '', '', ''];

    if (lp.filters) {
      lp.filters?.forEach((f) => {
        if (f.column === 'companyId') {
          arrayNumberError(f.values, 'CompanyID is not a number');
          company = `AND contract."companyId" IN ${arrayToQueryArray(f.values)}`;
        }
        if (f.column === 'productId') {
          arrayNumberError(f.values, 'ProductID is not a number');
          product = `AND p."productId" IN ${arrayToQueryArray(f.values)}`;
        }
        if (f.column === 'status') {
          arrayLetterError(f.values, 'Status is not letter-only');
          status = `AND a1."subType" IN ${arrayToQueryArray(f.values)}`;
        }
        if (f.column === 'invoiced') {
          if (f.values[0] === -1) {
            invoice = 'AND p."invoiceId" IS NULL';
          } else {
            arrayNumberError(f.values, 'InvoiceID is not a number');
            invoice = `AND ${inYearsFilter('invoice."startDate"', f.values)}`;
          }
        }
      });
    }

    return {
      company, product, status, invoice,
    };
  }

  getContractWithProductsAndTheirStatusesCount = async (lp: ListParams): Promise<number> => {
    const filters = this.processFilters(lp);

    const result = await this.postProcessing(`
          SELECT COUNT(DISTINCT contract."companyId") as count
          FROM product_instance p
          JOIN product_instance_activity a1 ON (p.id = a1."productInstanceId" AND a1.type = 'STATUS' ${filters.status})
          LEFT OUTER JOIN product_instance_activity a2 ON (p.id = a2."productInstanceId" AND
            (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)) AND
            a2.type = 'STATUS')
          LEFT JOIN contract ON contract.id = p."contractId"
          LEFT JOIN invoice ON invoice.id = p."invoiceId"
          WHERE (a2.id is NULL ${filters.invoice} ${filters.product} ${filters.company})
        `);
    return parseInt(result[0].count, 10);
  };

  getContractWithProductsAndTheirStatusesCountProd = async (lp: ListParams): Promise<number> => {
    const filters = this.processFilters(lp);

    const result = await this.postProcessing(`
          SELECT COUNT(DISTINCT p.id) as count
          FROM product_instance p
          JOIN product_instance_activity a1 ON (p.id = a1."productInstanceId" AND a1.type = 'STATUS' ${filters.status})
          LEFT OUTER JOIN product_instance_activity a2 ON (p.id = a2."productInstanceId" AND
            (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)) AND
            a2.type = 'STATUS')
          LEFT JOIN contract ON contract.id = p."contractId"
          LEFT JOIN invoice ON invoice.id = p."invoiceId"
          WHERE (a2.id is NULL ${filters.invoice} ${filters.product} ${filters.company})
        `);
    return parseInt(result[0].count, 10);
  };

  getContractWithProductsAndTheirStatusesSumProducts = async (lp: ListParams): Promise<number> => {
    const filters = this.processFilters(lp);

    const result = await this.postProcessing(`
          SELECT SUM(p."basePrice" - p."discount") as sum
          FROM product_instance p
          JOIN product_instance_activity a1 ON (p.id = a1."productInstanceId" AND a1.type = 'STATUS' ${filters.status})
          LEFT OUTER JOIN product_instance_activity a2 ON (p.id = a2."productInstanceId" AND
            (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)) AND
            a2.type = 'STATUS')
          LEFT JOIN contract ON contract.id = p."contractId"
          LEFT JOIN invoice ON invoice.id = p."invoiceId"
          WHERE (a2.id is NULL ${filters.invoice} ${filters.product} ${filters.company})
        `);
    return parseInt(result[0].sum, 10);
  };

  getContractWithProductsAndTheirStatuses = async (lp: ListParams): Promise<ETCompany[]> => {
    let query = '';

    const filters = this.processFilters(lp);

    letterError(lp.sorting!.direction, 'Sort direction is not letter-only');
    numberError(lp.skip!, 'Skip-number is not a number');

    const sorting = lp.sorting !== undefined && lp.sorting.column === 'companyName' ? `company.name ${lp.sorting.direction}` : 'company.id';

    query += `
        SELECT company.id as id, company.name as name,
          contract.id as "contractId", contract.title as "contractTitle",
          p.id as "productInstanceId", p."productId" as "productId", invoice."startDate" as "invoiceDate", a1."subType" as "subType", p."basePrice" as "basePrice", p.discount as discount, p.details as details
        FROM product_instance p
        JOIN product_instance_activity a1 ON (p.id = a1."productInstanceId" AND a1.type = 'STATUS' ${filters.status})
        LEFT OUTER JOIN product_instance_activity a2 ON (p.id = a2."productInstanceId" AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)) AND
          a2.type = 'STATUS')
        LEFT JOIN contract ON contract.id = p."contractId"
        LEFT JOIN company ON company.id = contract."companyId"
        LEFT JOIN invoice ON invoice.id = p."invoiceId"
        WHERE (a2.id is NULL ${filters.company} ${filters.invoice} ${filters.product} AND company.id IN (
          SELECT id
          FROM (
            SELECT ROW_NUMBER() OVER (ORDER BY company.id) as rownr, company.id as id
            FROM product_instance p
            JOIN product_instance_activity a1 ON (p.id = a1."productInstanceId" AND a1.type = 'STATUS' ${filters.status})
            LEFT OUTER JOIN product_instance_activity a2 ON (p.id = a2."productInstanceId" AND
              (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)) AND
              a2.type = 'STATUS')
            LEFT JOIN contract ON contract.id = p."contractId"
            LEFT JOIN company ON company.id = contract."companyId"
            LEFT JOIN invoice ON invoice.id = p."invoiceId"
            WHERE (a2.id is NULL ${filters.company} ${filters.invoice} ${filters.product})
            GROUP BY company.id
            ORDER BY company.id
          ) as x
          ${lp.take ? `WHERE (rownr > ${lp.skip || 0} AND rownr < ${(lp.skip || 0) + lp.take}` : ''})
        ))
        ORDER BY ${sorting}, contract.id, p.id
      `;

    // MySQL is not able to return JSON many-to-one relations as JSON objects.
    // Therefore, the query above returns all product instances with their contract
    // and company information. This is a lot of duplicate information, so we need
    // to parse all these rows to a list of objects without duplicate information.
    const data: any[] = await this.postProcessing(query);
    const r = [];
    let companyId = -1;
    let contractId = -1;

    for (let i = 0; i < data.length; i++) {
      if (companyId === data[i].id) {
        if (contractId === data[i].contractId) {
          r[r.length - 1].contracts[r[r.length - 1].contracts.length - 1].products.push({
            id: data[i].productInstanceId,
            productId: data[i].productId,
            invoiceDate: data[i].invoiceDate,
            basePrice: data[i].basePrice,
            discount: data[i].discount,
            subType: data[i].subType,
            details: data[i].details,
          });
        } else {
          r[r.length - 1].contracts.push({
            id: data[i].contractId,
            title: data[i].contractTitle,
            products: [
              {
                id: data[i].productInstanceId,
                productId: data[i].productId,
                invoiceDate: data[i].invoiceDate,
                basePrice: data[i].basePrice,
                discount: data[i].discount,
                subType: data[i].subType,
                details: data[i].details,
              },
            ],
          });
          contractId = data[i].contractId;
        }
      } else {
        r.push({
          id: data[i].id,
          name: data[i].name,
          contracts: [
            {
              id: data[i].contractId,
              title: data[i].contractTitle,
              products: [
                {
                  id: data[i].productInstanceId,
                  productId: data[i].productId,
                  invoiceDate: data[i].invoiceDate,
                  basePrice: data[i].basePrice,
                  discount: data[i].discount,
                  subType: data[i].subType,
                  details: data[i].details,
                },
              ],
            },
          ],
        });
        companyId = data[i].id;
        contractId = data[i].contractId;
      }
    }

    return r as ETCompany[];
  };

  getRecentContractsWithStatus = (limit: number, userId?: number): Promise<RecentContract[]> => {
    numberError(limit, 'Limit is not a number');
    numberError(userId!, 'userID is not a number');

    return this.postProcessing(`
    SELECT c.id, c.title, c."companyId", c."assignedToId", c."contactId", a1."createdAt",
        a1."updatedAt", a1."type", a1."description", a1."createdById", a1."subType"
    FROM contract c
    JOIN contract_activity a1 ON (c.id = a1."contractId")
    LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND
        (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
    WHERE (a2.id IS NULL ${userId ? `AND c."assignedToId" = ${userId}` : ''})
    ORDER BY a1."updatedAt" desc
    LIMIT ${limit};
  `);
  };

  getExpiredInvoices = (): Promise<ExpiredInvoice[]> => {
    return this.postProcessing(`
    SELECT i.id, i.version, i."startDate", i."companyId", i."assignedToId", i."createdAt", a1."updatedAt", a1."createdById", (
      SELECT sum(p."basePrice" - p.discount)
      FROM product_instance p
      WHERE p."invoiceId" = i.id
    ) as value
    FROM invoice i
    JOIN invoice_activity a1 ON (i.id = a1."invoiceId" AND a1.type = 'STATUS')
    LEFT OUTER JOIN invoice_activity a2 ON (i.id = a2."invoiceId" AND a1.type = 'STATUS' AND
        (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
    WHERE (a2.id IS NULL AND a1."subType" = 'SENT' AND date(i."startDate") < current_date - interval '1' day);
  `);
  };

  async getContractIdsByStatus(statuses: ContractStatus[]): Promise<number[]> {
    if (statuses.length === 0) return [];

    arrayLetterError(statuses, 'Status is not letter-only');

    let whereClause = `a1."subType" = '${statuses[0]}'`;
    for (let i = 1; i < statuses.length; i++) {
      whereClause += ` OR a1."subType" = '${statuses[i]}'`;
    }

    return this.postProcessing(`
    SELECT c.id
    FROM contract c
    JOIN contract_activity a1 ON (c.id = a1."contractId" AND a1.type = 'STATUS')
    LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND a2.type = 'STATUS' AND
        (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
    WHERE (a2.id IS NULL AND (${whereClause}))
    `);
  }

  async getInvoiceIdsByStatus(statuses: InvoiceStatus[]): Promise<number[]> {
    if (statuses.length === 0) return [];

    arrayLetterError(statuses, 'Status is not letter-only');

    let whereClause = `a1."subType" = '${statuses[0]}'`;
    for (let i = 1; i < statuses.length; i++) {
      whereClause += ` OR a1."subType" = '${statuses[i]}'`;
    }

    return this.postProcessing(`
    SELECT i.id
    FROM invoice i
    JOIN invoice_activity a1 ON (i.id = a1."invoiceId" AND a1.type = 'STATUS')
    LEFT OUTER JOIN invoice_activity a2 ON (i.id = a2."invoiceId" AND a2.type = 'STATUS' AND
        (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
    WHERE (a2.id IS NULL AND (${whereClause}))
    `);
  }

  /** *********************
   *
   *   Statistical queries
   *
   ************************ */
  getProductsContractedPerMonthByFinancialYear = (year: number):
  Promise<ProductsPerCategoryPerPeriod[]> => {
    return this.postProcessing(`
      SELECT p."categoryId", EXTRACT(MONTH FROM a1."createdAt" + interval '6' month) as period, sum(pi."basePrice" - pi.discount) as amount, COUNT(pi.id) as "nrOfProducts"
      FROM product_instance pi
      JOIN product p ON (p.id = pi."productId")
      JOIN contract c ON (c.id = pi."contractId")
      JOIN contract_activity a1 ON (c.id = a1."contractId" AND a1.type = 'STATUS')
      LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND a2.type = 'STATUS' AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      WHERE (a2.id IS NULL AND a1."subType" = 'CONFIRMED' AND ${inYearFilter('a1."createdAt"', year)})
      GROUP BY p."categoryId", period
      ORDER BY p."categoryId", period;
    `);
  };

  getTotalSuggestedAmountByFinancialYear = (year: number): Promise<AnalysisResult[]> => {
    return this.postProcessing(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.id) as "nrOfProducts"
      FROM product_instance p
      JOIN contract c ON (p."contractId" = c.id)
      JOIN contract_activity a1 ON (c.id = a1."contractId" AND a1.type = 'STATUS' AND ${inOrBeforeYearFilter('a1."createdAt"', year)})
      LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND a2.type = 'STATUS' AND ${inOrBeforeYearFilter('a2."createdAt"', year)} AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      WHERE (a2.id IS NULL AND a1."subType" IN ('CREATED', 'PROPOSED', 'SENT') )
    `);
  };

  getTotalSignedAmountByFinancialYear = (year: number): Promise<AnalysisResult[]> => {
    return this.postProcessing(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.id) as "nrOfProducts"
      FROM product_instance p
      JOIN contract c ON (p."contractId" = c.id)
      JOIN contract_activity a1 ON (c.id = a1."contractId" AND a1.type = 'STATUS' AND ${inOrBeforeYearFilter('a1."createdAt"', year)})
      LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND a2.type = 'STATUS' AND ${inOrBeforeYearFilter('a2."createdAt"', year)} AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      WHERE (a2.id IS NULL AND a1."subType" IN ('CONFIRMED', 'CANCELLED', 'FINISHED') AND
          (p."invoiceId" IS NULL OR (
            SELECT EXTRACT(YEAR FROM i."startDate" + interval '6' month)
            FROM invoice i
            WHERE i.id = p."invoiceId"
          ) = ${year}))
    `);
  };

  getTotalDeliveredAmountByFinancialYear = (year: number): Promise<AnalysisResult[]> => {
    return this.postProcessing(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.id) as "nrOfProducts"
      FROM product_instance p
      JOIN product_instance_activity pa1 ON (p.id = pa1."productInstanceId" AND pa1.type = 'STATUS' AND ${inOrBeforeYearFilter('pa1."createdAt"', year)})
      LEFT OUTER JOIN product_instance_activity pa2 ON (p.id = pa2."productInstanceId" AND pa2.type = 'STATUS' AND ${inOrBeforeYearFilter('pa2."createdAt"', year)} AND
          (pa1."createdAt" < pa2."createdAt" OR (pa1."createdAt" = pa2."createdAt" AND pa1.id < pa2.id)))
      JOIN contract c ON (p."contractId" = c.id)
      JOIN contract_activity a1 ON (c.id = a1."contractId" AND a1.type = 'STATUS' AND ${inOrBeforeYearFilter('a1."createdAt"', year)})
      LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND a2.type = 'STATUS' AND ${inOrBeforeYearFilter('a2."createdAt"', year)} AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      WHERE (a2.id IS NULL AND a1."subType" IN ('CONFIRMED', 'CANCELLED', 'FINISHED') AND pa1."subType" = 'DELIVERED' AND
          (p."invoiceId" IS NULL OR (
            SELECT EXTRACT(YEAR FROM i."startDate" + interval '6' month)
            FROM invoice i
            WHERE i.id = p."invoiceId"
          ) = ${year}))
    `);
  };

  getTotalNonDeliveredProductsInvoicedAmountByFinancialYear = (year: number):
  Promise<AnalysisResult[]> => {
    return this.postProcessing(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.id) as "nrOfProducts"
      FROM product_instance p
      JOIN product_instance_activity pa1 ON (p.id = pa1."productInstanceId" AND pa1.type = 'STATUS' AND ${inYearFilter('pa1."createdAt"', year)})
      LEFT OUTER JOIN product_instance_activity pa2 ON (p.id = pa2."productInstanceId" AND pa2.type = 'STATUS' AND ${inYearFilter('pa2."createdAt"', year)} AND
          (pa1."createdAt" < pa2."createdAt" OR (pa1."createdAt" = pa2."createdAt" AND pa1.id < pa2.id)))
      JOIN invoice i ON (p."invoiceId" = i.id)
      JOIN invoice_activity ia1 ON (i.id = ia1."invoiceId" AND ia1.type = 'STATUS')
      LEFT OUTER JOIN invoice_activity ia2 ON (i.id = ia2."invoiceId" AND ia1.type = 'STATUS' AND
          (ia1."createdAt" < ia2."createdAt" OR (ia1."createdAt" = ia2."createdAt" AND ia1.id < ia2.id)))
      WHERE (ia2.id IS NULL AND ia1."subType" IN ('CREATED', 'SENT', 'PAID', 'IRRECOVERABLE') AND
          pa2.id is NULL AND pa1."subType" = 'NOTDELIVERED' AND
          ${inYearFilter('i."startDate"', year)} )
    `);
  };

  getTotalDeliveredProductsInvoicedAmountByFinancialYear = (year: number):
  Promise<AnalysisResult[]> => {
    return this.postProcessing(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.id) as "nrOfProducts"
      FROM product_instance p
      JOIN product_instance_activity pa1 ON (p.id = pa1."productInstanceId" AND pa1.type = 'STATUS')
      LEFT OUTER JOIN product_instance_activity pa2 ON (p.id = pa2."productInstanceId" AND pa2.type = 'STATUS' AND
          (pa1."createdAt" < pa2."createdAt" OR (pa1."createdAt" = pa2."createdAt" AND pa1.id < pa2.id)))
      JOIN invoice i ON (p."invoiceId" = i.id)
      JOIN invoice_activity ia1 ON (i.id = ia1."invoiceId" AND ia1.type = 'STATUS')
      LEFT OUTER JOIN invoice_activity ia2 ON (i.id = ia2."invoiceId" AND ia2.type = 'STATUS' AND
          (ia1."createdAt" < ia2."createdAt" OR (ia1."createdAt" = ia2."createdAt" AND ia1.id < ia2.id)))
      WHERE (ia2.id IS NULL AND ia1."subType" IN ('CREATED', 'SENT', 'PAID', 'IRRECOVERABLE') AND
          pa2.id is NULL AND pa1."subType" = 'DELIVERED' AND
          ${inYearFilter('i."startDate"', year)} )
    `);
  };

  getTotalInvoicesPaidAmountByFinancialYear = (year: number): Promise<AnalysisResult[]> => {
    return this.postProcessing(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.id) as "nrOfProducts"
      FROM product_instance p
      JOIN invoice i ON (p."invoiceId" = i.id)
      JOIN invoice_activity a1 ON (i.id = a1."invoiceId" AND a1.type = 'STATUS')
      LEFT OUTER JOIN invoice_activity a2 ON (i.id = a2."invoiceId" AND a2.type = 'STATUS' AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      WHERE (a2.id IS NULL AND a1."subType" = 'PAID' AND
          ${inYearFilter('i."startDate"', year)} )
    `);
  };

  getProductInstancesByFinancialYear = (id: number): Promise<AnalysisResultByYear[]> => {
    numberError(id, 'ID is not a number');

    return this.postProcessing(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.id) as "nrOfProducts",
        COALESCE(EXTRACT(YEAR FROM i."startDate" + interval '6' month), ${currentFinancialYear()}) as year
      FROM product_instance p
      LEFT JOIN invoice i ON (p."invoiceId" = i.id)
      LEFT JOIN product_instance_activity a1 ON (p.id = a1."productInstanceId" AND a1.type = 'STATUS')
      LEFT OUTER JOIN product_instance_activity a2 ON (p.id = a2."productInstanceId" AND a2.type = 'STATUS' AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      WHERE (a2.id IS NULL AND a1."subType" != '${ProductInstanceStatus.DEFERRED}' AND p."productId" = ${id} AND
          COALESCE(EXTRACT(YEAR FROM i."startDate" + interval '6' month), ${currentFinancialYear()}) > ${currentFinancialYear() - 10})
      GROUP BY year
    `);
  };

  getDeferredProductInstances = (id: number): Promise<AnalysisResultByYear> => {
    numberError(id, 'ID is not a number');

    return this.postProcessing(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.id) as "nrOfProducts",
        ${currentFinancialYear() + 1} as year
      FROM product_instance p
      LEFT JOIN invoice i ON (p."invoiceId" = i.id)
      LEFT JOIN product_instance_activity a1 ON (p.id = a1."productInstanceId" AND a1.type = 'STATUS')
      LEFT OUTER JOIN product_instance_activity a2 ON (p.id = a2."productInstanceId" AND a2.type = 'STATUS' AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      WHERE (a2.id IS NULL AND a1."subType" = '${ProductInstanceStatus.DEFERRED}' AND p."productId" = ${id})
      GROUP BY year
    `);
  };

  getProductsContractedPerFinancialYearByCompany = (id: number):
  Promise<ProductsPerCategoryPerPeriod[]> => {
    numberError(id, 'ID is not a number');

    return this.postProcessing(`
      SELECT p."categoryId", EXTRACT(YEAR FROM a1."createdAt" + interval '6' month) as period, sum(pi."basePrice" - pi.discount) as amount, COUNT(pi.id) as "nrOfProducts"
      FROM product_instance pi
      JOIN product p ON (p.id = pi."productId")
      JOIN contract c ON (c.id = pi."contractId")
      JOIN contract_activity a1 ON (c.id = a1."contractId" AND a1.type = 'STATUS')
      LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND a2.type = 'STATUS' AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      WHERE (a2.id IS NULL AND a1."subType" = 'CONFIRMED' AND c."companyId" = ${id} AND
          EXTRACT(YEAR FROM a1."createdAt" + interval '6' month) > ${currentFinancialYear() - 10})
      GROUP BY p."categoryId", period
      ORDER BY period, p."categoryId";
    `);
  };
}
