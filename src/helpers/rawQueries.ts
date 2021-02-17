import { getManager } from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { ActivityType } from '../entity/enums/ActivityType';
import { ContractStatus } from '../entity/enums/ContractStatus';
import { InvoiceStatus } from '../entity/enums/InvoiceStatus';

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

export interface ProductsPerCategoryPerMonth {
  categoryId: number,
  month: number,
  amount: number,
  nrOfProducts: number,
}

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

function inOrBeforeYearFilter(column: string, year: number): string {
  return `EXTRACT(YEAR FROM ${column} + interval '6' month) <= ${year}`;
}

function inYearFilter(column: string, year: number): string {
  return `EXTRACT(YEAR FROM ${column} + interval '6' month) = ${year}`;
}

export default class RawQueries {
  static getContractWithProductsAndTheirStatuses = (lp: ListParams, result: 'data' | 'count') => {
    let query = '';

    let [companyFilter, productFilter, statusFilter, invoicedFilter] = ['', '', '', ''];
    if (lp.filters) {
      lp.filters?.forEach((f) => {
        if (f.column === 'companyId') {
          companyFilter = `AND company.id IN ${arrayToQueryArray(f.values)}`;
        }
        if (f.column === 'productId') {
          productFilter = `AND p."productId" IN ${arrayToQueryArray(f.values)}`;
        }
        if (f.column === 'status') {
          statusFilter = `AND a1."subType" IN ${arrayToQueryArray(f.values)}`;
        }
        if (f.column === 'invoiced') {
          if (f.values[0]) {
            invoicedFilter = 'AND p."invoiceId" IS NOT NULL';
          } else {
            invoicedFilter = 'AND p."invoiceId" IS NULL';
          }
        }
      });
    }

    const sorting = lp.sorting && lp.sorting.column === 'companyName' ? `order by company.name ${lp.sorting.direction}` : '';

    query += `
      SELECT company.id, company.name,
      (
      select array_to_json(array_agg(row_to_json(t)))
      from (
          select contract.id, contract.title,
        (
          select array_to_json(array_agg(row_to_json(d)))
          from (
          SELECT p.*, a1.*
          FROM product_instance p
          JOIN product_instance_activity a1 ON (p.id = a1."productInstanceId" AND a1.type = 'STATUS' ${statusFilter})
          LEFT OUTER JOIN product_instance_activity a2 ON (p.id = a2."productInstanceId" AND
            (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)) AND
             a2.type = 'STATUS')
          WHERE (a2.id IS NULL AND contract.id = p."contractId" ${productFilter} ${invoicedFilter})
          ) d
        ) as products
        from contract
        where (contract."companyId" = company.id AND (
          SELECT COUNT(*)
          FROM product_instance p
          JOIN product_instance_activity a1 ON (p.id = a1."productInstanceId" AND a1.type = 'STATUS' ${statusFilter})
          LEFT OUTER JOIN product_instance_activity a2 ON (p.id = a2."productInstanceId" AND
            (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)) AND
             a2.type = 'STATUS')
          WHERE (a2.id IS NULL AND contract.id = p."contractId" ${productFilter} ${invoicedFilter})
          ) > 0)
      ) t
      ) as contracts
      from company
      where ((
        SELECT COUNT(*)
        FROM contract qc
        WHERE (qc."companyId" = company.id)
      ) > 0 AND (
        SELECT COUNT(*)
        FROM contract contract
        JOIN product_instance p ON (p."contractId" = contract.id)
        JOIN product_instance_activity a1 ON (p.id = a1."productInstanceId" AND a1.type = 'STATUS' ${statusFilter})
        LEFT OUTER JOIN product_instance_activity a2 ON (p.id = a2."productInstanceId" AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)) AND
           a2.type = 'STATUS')
        WHERE (a2.id IS NULL AND contract."companyId" = company.id ${productFilter} ${invoicedFilter})
      ) > 0) ${companyFilter}
      ${sorting}
    `;

    if (result === 'count') {
      return getManager().query(`
        SELECT COUNT(*)
        FROM (
          ${query}
        ) x
      `);
    }

    if (lp.take) {
      query += `LIMIT ${lp.take}`;
      if (lp.skip) query += ` OFFSET ${lp.skip}`;
    }
    return getManager().query(query);
  };

  static getRecentContractsWithStatus = (limit: number, userId?: number):
  Promise<RecentContract[]> => {
    return getManager().query(`
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

  static getExpiredInvoices = (): Promise<ExpiredInvoice[]> => {
    return getManager().query(`
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

  static async getContractIdsByStatus(statuses: ContractStatus[]): Promise<number[]> {
    if (statuses.length === 0) return [];

    let whereClause = `a1."subType" = '${statuses[0]}'`;
    for (let i = 1; i < statuses.length; i++) {
      whereClause += ` OR a1."subType" = '${statuses[i]}'`;
    }

    return getManager().query(`
    SELECT c.id
    FROM contract c
    JOIN contract_activity a1 ON (c.id = a1."contractId" AND a1.type = 'STATUS')
    LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND a2.type = 'STATUS' AND
        (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
    WHERE (a2.id IS NULL AND (${whereClause}))
    `);
  }

  static async getInvoiceIdsByStatus(statuses: InvoiceStatus[]): Promise<number[]> {
    if (statuses.length === 0) return [];

    let whereClause = `a1."subType" = '${statuses[0]}'`;
    for (let i = 1; i < statuses.length; i++) {
      whereClause += ` OR a1."subType" = '${statuses[i]}'`;
    }

    return getManager().query(`
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
  static getProductsContractedPerMonthByFinancialYear = (year: number):
  Promise<ProductsPerCategoryPerMonth[]> => {
    return getManager().query(`
      SELECT p."categoryId", EXTRACT(MONTH FROM a1."createdAt" + interval '6' month) as month, sum(pi."basePrice" - pi.discount) as amount, COUNT(pi.*) as "nrOfProducts"
      FROM product_instance pi
      JOIN product p ON (p.id = pi."productId")
      JOIN contract c ON (c.id = pi."contractId")
      JOIN contract_activity a1 ON (c.id = a1."contractId" AND a1.type = 'STATUS')
      LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND a2.type = 'STATUS' AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      WHERE (a2.id IS NULL AND a1."subType" = 'CONFIRMED' AND ${inYearFilter('a1."createdAt"', year)})
      GROUP BY p."categoryId", month
      ORDER BY month, p."categoryId";
    `);
  };

  static getTotalSuggestedAmountByFinancialYear = (year: number): Promise<AnalysisResult[]> => {
    return getManager().query(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.*) as "nrOfProducts"
      FROM product_instance p
      JOIN contract c ON (p."contractId" = c.id)
      JOIN contract_activity a1 ON (c.id = a1."contractId" AND a1.type = 'STATUS' AND ${inOrBeforeYearFilter('a1."createdAt"', year)})
      LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND a2.type = 'STATUS' AND ${inOrBeforeYearFilter('a2."createdAt"', year)} AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      WHERE (a2.id IS NULL AND a1."subType" IN ('CREATED', 'PROPOSED', 'SENT') )
    `);
  };

  static getTotalSignedAmountByFinancialYear = (year: number): Promise<AnalysisResult[]> => {
    return getManager().query(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.*) as "nrOfProducts"
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

  static getTotalDeliveredAmountByFinancialYear = (year: number): Promise<AnalysisResult[]> => {
    return getManager().query(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.*) as "nrOfProducts"
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

  static getTotalNonDeliveredProductsInvoicedAmountByFinancialYear = (year: number):
  Promise<AnalysisResult[]> => {
    return getManager().query(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.*) as "nrOfProducts"
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

  static getTotalDeliveredProductsInvoicedAmountByFinancialYear = (year: number):
  Promise<AnalysisResult[]> => {
    return getManager().query(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.*) as "nrOfProducts"
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

  static getTotalInvoicesPaidAmountByFinancialYear = (year: number): Promise<AnalysisResult[]> => {
    return getManager().query(`
      SELECT COALESCE(sum(p."basePrice" - p.discount), 0) as amount, count(p.*) as "nrOfProducts"
      FROM product_instance p
      JOIN invoice i ON (p."invoiceId" = i.id)
      JOIN invoice_activity a1 ON (i.id = a1."invoiceId" AND a1.type = 'STATUS')
      LEFT OUTER JOIN invoice_activity a2 ON (i.id = a2."invoiceId" AND a2.type = 'STATUS' AND
          (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
      WHERE (a2.id IS NULL AND a1."subType" = 'PAID' AND
          ${inYearFilter('i."startDate"', year)} )
    `);
  };
}
