import { Product } from '../entity/Product';
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

    p.description = p.description.replaceAll('{instelling}', '\\GEWISRecipient\\xspace');
    p.contractTextDutch = p.contractTextDutch.replaceAll('{instelling}', '\\GEWISRecipient\\xspace');
    p.contractTextEnglish = p.contractTextEnglish.replaceAll('{instelling}', '\\GEWISRecipient\\xspace');
    p.deliverySpecificationDutch = p.deliverySpecificationDutch!.replaceAll('{instelling}', '\\GEWISRecipient\\xspace');
    p.deliverySpecificationEnglish = p.deliverySpecificationEnglish!.replaceAll(
      '{instelling}',
      '\\GEWISRecipient\\xspace',
    );

    await p.save();
  }

  console.warn(
    `The following products had one or multiple instances of {instelling} replaced (${count}): ${logResult.substr(0, logResult.length - 2)}`,
  );
}
