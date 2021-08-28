import { Connection } from 'typeorm';
import { ProductInstance } from '../entity/ProductInstance';
import { ProductInstanceActivity } from '../entity/activity/ProductInstanceActivity';
import { ProductInstanceStatus } from '../entity/enums/ProductActivityStatus';
import { ActivityType } from '../entity/enums/ActivityType';

/**
 * All product instances should have a status "NOTDELIVERED". If they don't, create it.
 * @param connection TypeORM connection to the database
 */
export async function allProductInstancesWereNotDelivered(connection: Connection) {
  let logResult = '';
  let count = 0;
  const productRepo = connection.getRepository(ProductInstance);
  const activityRepo = connection.getRepository(ProductInstanceActivity);
  const productInstances = await productRepo.find({ relations: ['activities', 'contract'] });

  productInstances.forEach((p) => {
    const notDeliveredStatus = p.activities.find(
      (a) => a.subType === ProductInstanceStatus.NOTDELIVERED,
    );
    if (notDeliveredStatus === undefined) {
      activityRepo.save({
        createdAt: new Date(p.createdAt.getDate() - 1),
        updatedAt: new Date(),
        productInstanceId: p.id,
        createdById: p.contract.createdById,
        type: ActivityType.STATUS,
        subType: ProductInstanceStatus.NOTDELIVERED,
        descriptionEnglish: '',
        descriptionDutch: '',
      } as ProductInstanceActivity);

      logResult += `C${p.contractId} (P${p.id}), `;
      count++;
    }
  });

  console.log(`The following contracts had products that do not have a 'NOTDELIVERED' status (${count}): ${logResult.substr(0, logResult.length - 2)}`);
}
