import { getManager } from 'typeorm';
import { ListParams } from '../controllers/ListParams';

export default class RawQueries {
  static getContractWithProductsAndTheirStatuses = (lp: ListParams, result: 'data' | 'count') => {
    let query = '';

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
          JOIN product_instance_activity a1 ON (p.id = a1."productInstanceId" AND a1.type = 'STATUS')
          LEFT OUTER JOIN product_instance_activity a2 ON (p.id = a2."productInstanceId" AND
            (a1."createdAt" < a2."createdAt" OR (a1."createdAt" = a2."createdAt" AND a1.id < a2.id)) AND
             a2.type = 'STATUS')
          WHERE (a2.id IS NULL AND contract.id = p."contractId")
          ) d
        ) as products
        from contract
        where (contract."companyId" = company.id AND (
          SELECT COUNT(*)
          FROM product_instance cp
          JOIN product_instance_activity ca1 ON (cp.id = ca1."productInstanceId" AND ca1.type = 'STATUS')
          LEFT OUTER JOIN product_instance_activity ca2 ON (cp.id = ca2."productInstanceId" AND
            (ca1."createdAt" < ca2."createdAt" OR (ca1."createdAt" = ca2."createdAt" AND ca1.id < ca2.id)) AND
             ca2.type = 'STATUS')
          WHERE (ca2.id IS NULL AND contract.id = cp."contractId")
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
        FROM contract ccp
        JOIN product_instance ccpi ON (ccpi."contractId" = ccp.id)
        JOIN product_instance_activity cca1 ON (ccpi.id = cca1."productInstanceId" AND cca1.type = 'STATUS')
        LEFT OUTER JOIN product_instance_activity cca2 ON (ccpi.id = cca2."productInstanceId" AND
          (cca1."createdAt" < cca2."createdAt" OR (cca1."createdAt" = cca2."createdAt" AND cca1.id < cca2.id)) AND
           cca2.type = 'STATUS')
        WHERE (cca2.id IS NULL AND ccp."companyId" = company.id)
      ) > 0)
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
