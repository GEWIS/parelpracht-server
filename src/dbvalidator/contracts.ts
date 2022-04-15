import { Contract } from '../entity/Contract';
import { ContractActivity } from '../entity/activity/ContractActivity';
import { ContractStatus } from '../entity/enums/ContractStatus';
import { ActivityType } from '../entity/enums/ActivityType';
import { ProductInstanceActivity } from '../entity/activity/ProductInstanceActivity';
import { ProductInstanceStatus } from '../entity/enums/ProductActivityStatus';
import AppDataSource from '../database';

/**
 * Loop over all contracts. If a contract does not have a "CREATED" status, create it.
 * The createdAt will be set to the createdAt of the contract. The updatedAt will be the
 * current time.
 */
export async function allContractsAreCreated() {
  let logResult = '';
  let count = 0;
  const contractRepo = AppDataSource.getRepository(Contract);
  const activityRepo = AppDataSource.getRepository(ContractActivity);
  const contracts = await contractRepo.find({ relations: ['activities'] });

  contracts.forEach((c) => {
    const createdStatus = c.activities.find((a) => a.subType === ContractStatus.CREATED);
    if (createdStatus === undefined) {
      activityRepo.save({
        createdAt: new Date(c.createdAt.getDate() - 1),
        updatedAt: new Date(),
        createdById: c.createdById,
        contractId: c.id,
        type: ActivityType.STATUS,
        subType: ContractStatus.CREATED,
        descriptionEnglish: '',
        descriptionDutch: '',
      } as ContractActivity);

      logResult += `C${c.id}, `;
      count++;
    }
  });

  console.log(`The following contracts did not have a 'CREATED' status (${count}): ${logResult.substr(0, logResult.length - 2)}`);
}

/**
 * Loop over all contracts. If a contract is cancelled, loop over all products. All products should
 * have status "CANCELLED". If they don't, create this status.
 */
export async function allProductsAreCancelledIfContractIsCancelled() {
  let logResult = '';
  let count = 0;
  const contractRepo = AppDataSource.getRepository(Contract);
  const productInstanceActivityRepo = AppDataSource.getRepository(ProductInstanceActivity);
  const contracts = await contractRepo.find({ relations: ['products', 'products.activities', 'activities'] });

  contracts
    .forEach((c) => {
      const cancelledActivity = c.activities.find((a) => a.subType === ContractStatus.CANCELLED);

      if (cancelledActivity) {
        c.products.forEach((p) => {
          const index = p.activities.find((a) => a.subType === ProductInstanceStatus.CANCELLED);

          if (index === undefined) {
            productInstanceActivityRepo.save({
              createdAt: cancelledActivity.createdAt,
              updatedAt: new Date(),
              productInstanceId: p.id,
              createdById: c.createdById,
              type: ActivityType.STATUS,
              subType: ProductInstanceStatus.CANCELLED,
              descriptionEnglish: '',
              descriptionDutch: '',
            } as ProductInstanceActivity);

            logResult += `C${c.id} (P${p.id}), `;
            count++;
          }
        });
      }
    });

  console.log(`The following cancelled contracts had non-cancelled products (${count}): ${logResult.substr(0, logResult.length - 2)}`);
}

/**
 * Loop over all contracts. If a contract is finished, loop over all products. All products should
 * have status "DELIVERED" or "CANCELLED". If they don't, create a "DELIVERED" status.
 */
export async function allProductsAreDeliveredIfContractIsFinished() {
  let logResult = '';
  let count = 0;
  const contractRepo = AppDataSource.getRepository(Contract);
  const productInstanceActivityRepo = AppDataSource.getRepository(ProductInstanceActivity);
  const contracts = await contractRepo.find({ relations: ['products', 'products.activities', 'activities'] });

  contracts
    .forEach((c) => {
      const finishedActivity = c.activities.find((a) => a.subType === ContractStatus.FINISHED);

      if (finishedActivity) {
        c.products.forEach((p) => {
          const index = p.activities.find((a) => a.subType === ProductInstanceStatus.CANCELLED
            || a.subType === ProductInstanceStatus.DELIVERED);

          if (index === undefined) {
            productInstanceActivityRepo.save({
              createdAt: finishedActivity.createdAt,
              updatedAt: new Date(),
              productInstanceId: p.id,
              createdById: c.createdById,
              type: ActivityType.STATUS,
              subType: ProductInstanceStatus.DELIVERED,
              descriptionEnglish: '',
              descriptionDutch: '',
            } as ProductInstanceActivity);

            logResult += `C${c.id} (P${p.id}), `;
            count++;
          }
        });
      }
    });

  console.log(`The following contracts were finished, but did not have delivered/cancelled products (${count}): ${logResult.substr(0, logResult.length - 2)}`);
}
