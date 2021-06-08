import { Connection } from 'typeorm';
import { Invoice } from '../entity/Invoice';
import { InvoiceActivity } from '../entity/activity/InvoiceActivity';
import { ActivityType } from '../entity/enums/ActivityType';
import { InvoiceStatus } from '../entity/enums/InvoiceStatus';

/**
 * All invoices in the database should have a status "CREATED". If not, create it.
 * @param connection TypeORM connection to the database
 */
export async function allInvoicesAreCreated(connection: Connection) {
  let logResult = '';
  let count = 0;
  const invoiceRepo = connection.getRepository(Invoice);
  const activityRepo = connection.getRepository(InvoiceActivity);
  const invoices = await invoiceRepo.find({ relations: ['activities'] });

  invoices.forEach((i) => {
    const createdStatus = i.activities.find((a) => a.subType === InvoiceStatus.CREATED);
    if (createdStatus === undefined) {
      activityRepo.save({
        createdAt: i.createdAt,
        updatedAt: new Date(),
        createdById: i.createdById,
        invoiceId: i.id,
        type: ActivityType.STATUS,
        subType: InvoiceStatus.CREATED,
        description: '',
      } as InvoiceActivity);

      logResult += `F${i.id}, `;
      count++;
    }
  });

  console.log(`The following invoices did not have a 'CREATED' status (${count}): ${logResult.substr(0, logResult.length - 2)}`);
}
