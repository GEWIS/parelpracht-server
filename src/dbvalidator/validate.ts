import { config } from 'dotenv';
import AppDataSource from '../database';
import {
  allContractsAreCreated,
  allProductsAreCancelledIfContractIsCancelled,
  allProductsAreDeliveredIfContractIsFinished,
} from './contracts';
import { allInvoicesAreCreated } from './invoices';
import { allProductInstancesWereNotDelivered } from './productInstances';
import { replaceGEWISRecipient } from './GEWISrecipient';

config({ path: '.env' });

AppDataSource.initialize()
  .then(async () => {
    const t1 = new Date();
    console.info('Start database validation...');
    await Promise.all([
      allContractsAreCreated(),
      allInvoicesAreCreated(),
      allProductInstancesWereNotDelivered(),
      allProductsAreCancelledIfContractIsCancelled(),
      allProductsAreDeliveredIfContractIsFinished(),
      replaceGEWISRecipient(),
    ]);
    console.info(`Database validated in ${new Date().getTime() - t1.getTime()}ms`);
  })
  .catch((e) => console.error(e));
