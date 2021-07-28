/* eslint-disable no-param-reassign */
import { Connection } from 'typeorm';
import { Product } from '../entity/Product';
import replaceAll from '../helpers/replaceAll';

/**
 * All invoices in the database should have a status "CREATED". If not, create it.
 * @param connection TypeORM connection to the database
 */
export async function replaceGEWISRecipient(connection: Connection) {
  let logResult = '';
  let count = 0;
  const productRepo = connection.getRepository(Product);
  const products = await productRepo.find();
  products.forEach((p) => {
    if (p.description.includes('{instelling}')
    || p.contractTextDutch.includes('{instelling}')
    || p.contractTextEnglish.includes('{instelling}')
    || p.deliverySpecificationDutch!.includes('{instelling}')
    || p.deliverySpecificationEnglish!.includes('{instelling}')) {
      logResult += `P${p.id}, `;
      count++;
    }

    p.description = replaceAll(p.description, '{instelling}', '\\GEWISrecipient\\');
    p.contractTextDutch = replaceAll(p.contractTextDutch, '{instelling}', '\\GEWISrecipient\\');
    p.contractTextEnglish = replaceAll(p.contractTextEnglish, '{instelling}', '\\GEWISrecipient\\');
    p.deliverySpecificationDutch = replaceAll(p.deliverySpecificationDutch!, '{instelling}', '\\GEWISrecipient\\');
    p.deliverySpecificationEnglish = replaceAll(p.deliverySpecificationEnglish!, '{instelling}', '\\GEWISrecipient\\');

    p.save();
  });

  console.log(`The following products had one or multiple instances of {instelling} replaced (${count}): ${logResult.substr(0, logResult.length - 2)}`);
}