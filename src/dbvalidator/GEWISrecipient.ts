import { Product } from '../entity/Product';
import replaceAll from '../helpers/replaceAll';
import AppDataSource from '../database';

/**
 * All invoices in the database should have a status "CREATED". If not, create it.
 */
export async function replaceGEWISRecipient() {
  let logResult = '';
  let count = 0;
  const productRepo = AppDataSource.getRepository(Product);
  const products = await productRepo.find();
  for (const p of products) {
    if (
      p.description.includes('{instelling}') ||
      p.contractTextDutch.includes('{instelling}') ||
      p.contractTextEnglish.includes('{instelling}') ||
      p.deliverySpecificationDutch!.includes('{instelling}') ||
      p.deliverySpecificationEnglish!.includes('{instelling}')
    ) {
      logResult += `P${p.id}, `;
      count++;
    }

    p.description = replaceAll(p.description, '{instelling}', '\\GEWISRecipient\\xspace');
    p.contractTextDutch = replaceAll(p.contractTextDutch, '{instelling}', '\\GEWISRecipient\\xspace');
    p.contractTextEnglish = replaceAll(p.contractTextEnglish, '{instelling}', '\\GEWISRecipient\\xspace');
    p.deliverySpecificationDutch = replaceAll(
      p.deliverySpecificationDutch!,
      '{instelling}',
      '\\GEWISRecipient\\xspace',
    );
    p.deliverySpecificationEnglish = replaceAll(
      p.deliverySpecificationEnglish!,
      '{instelling}',
      '\\GEWISRecipient\\xspace',
    );

    await p.save();
  }

  console.warn(
    `The following products had one or multiple instances of {instelling} replaced (${count}): ${logResult.substr(0, logResult.length - 2)}`,
  );
}
