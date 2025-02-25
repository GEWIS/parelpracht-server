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

AppDataSource.initialize().then(async () => {
  const t1 = new Date();
  console.log('Start database validation...');
  await Promise.all([
    allContractsAreCreated(),
    allInvoicesAreCreated(),
    allProductInstancesWereNotDelivered(),
    allProductsAreCancelledIfContractIsCancelled(),
    allProductsAreDeliveredIfContractIsFinished(),
    replaceGEWISRecipient(),
  ]);
  console.log(`Database validated in ${new Date().getTime() - t1.getTime()}ms`);
});
