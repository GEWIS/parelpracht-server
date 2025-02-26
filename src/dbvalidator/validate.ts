import dotenv from 'dotenv';
import AppDataSource from '../database';
import {
  allContractsAreCreated,
  allProductsAreCancelledIfContractIsCancelled,
  allProductsAreDeliveredIfContractIsFinished,
} from './contracts';
import { allInvoicesAreCreated } from './invoices';
import { allProductInstancesWereNotDelivered } from './productInstances';
import { replaceGEWISRecipient } from './GEWISrecipient';

dotenv.config({ path: '.env' });

AppDataSource.initialize()
  .then(async () => {
    const t1 = new Date();
    console.warn('Start database validation...');
    await Promise.all([
      allContractsAreCreated(),
      allInvoicesAreCreated(),
      allProductInstancesWereNotDelivered(),
      allProductsAreCancelledIfContractIsCancelled(),
      allProductsAreDeliveredIfContractIsFinished(),
      replaceGEWISRecipient(),
    ]);
    console.warn(`Database validated in ${new Date().getTime() - t1.getTime()}ms`);
  })
  .catch((e) => console.error(e));
