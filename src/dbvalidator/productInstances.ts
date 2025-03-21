import { ProductInstance } from '../entity/ProductInstance';
import { ProductInstanceActivity } from '../entity/activity/ProductInstanceActivity';
import { ProductInstanceStatus } from '../entity/enums/ProductActivityStatus';
import { ActivityType } from '../entity/enums/ActivityType';
import AppDataSource from '../database';

/**
 * All product instances should have a status "NOTDELIVERED". If they don't, create it.
 */
export async function allProductInstancesWereNotDelivered() {
  let logResult = '';
  let count = 0;
  const productRepo = AppDataSource.getRepository(ProductInstance);
  const activityRepo = AppDataSource.getRepository(ProductInstanceActivity);
  const productInstances = await productRepo.find({ relations: ['activities', 'contract'] });

  for (const p of productInstances) {
    const notDeliveredStatus = p.activities.find((a) => a.subType === ProductInstanceStatus.NOTDELIVERED);
    if (notDeliveredStatus === undefined) {
      await activityRepo.save({
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
  }

  console.warn(
    `The following contracts had products that do not have a 'NOTDELIVERED' status (${count}): ${logResult.substr(0, logResult.length - 2)}`,
  );
}
