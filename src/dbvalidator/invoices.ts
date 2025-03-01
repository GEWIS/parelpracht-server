import { Invoice } from '../entity/Invoice';
import { InvoiceActivity } from '../entity/activity/InvoiceActivity';
import { ActivityType } from '../entity/enums/ActivityType';
import { InvoiceStatus } from '../entity/enums/InvoiceStatus';
import AppDataSource from '../database';

/**
 * All invoices in the database should have a status "CREATED". If not, create it.
 */
export async function allInvoicesAreCreated() {
  let logResult = '';
  let count = 0;
  const invoiceRepo = AppDataSource.getRepository(Invoice);
  const activityRepo = AppDataSource.getRepository(InvoiceActivity);
  const invoices = await invoiceRepo.find({ relations: ['activities'] });

  for (const i of invoices) {
    const createdStatus = i.activities.find((a) => a.subType === InvoiceStatus.CREATED);
    if (createdStatus === undefined) {
      await activityRepo.save({
        createdAt: new Date(i.createdAt.getDate() - 1),
        updatedAt: new Date(),
        createdById: i.createdById,
        invoiceId: i.id,
        type: ActivityType.STATUS,
        subType: InvoiceStatus.CREATED,
        descriptionEnglish: '',
        descriptionDutch: '',
      } as InvoiceActivity);

      logResult += `F${i.id}, `;
      count++;
    }
  }

  console.warn(
    `The following invoices did not have a 'CREATED' status (${count}): ${logResult.substr(0, logResult.length - 2)}`,
  );
}
