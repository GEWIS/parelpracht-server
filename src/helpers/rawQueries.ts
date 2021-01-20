import { getManager } from 'typeorm';
import { ListParams } from '../controllers/ListParams';

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

export default class RawQueries {
  static getContractWithProductsAndTheirStatuses = (lp: ListParams, result: 'data' | 'count') => {
    let query = '';

    let [companyFilter, productFilter, statusFilter, invoicedFilter] = ['', '', '', ''];
    if (lp.filters) lp.filters?.forEach((f) => {
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
      order by company.name asc
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

  static getContractWithRecentActivity = () => {
    return getManager().query(`
    SELECT c.*, a1.*
    FROM contract c
    JOIN contract_activity a1 ON (c.id = a1."contractId")
    LEFT OUTER JOIN contract_activity a2 ON (c.id = a2."contractId" AND
        (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)))
    WHERE (a2.id IS NULL AND a1."subType" = 'CONFIRMED');
  `);
  };
}
