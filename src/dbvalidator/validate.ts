import dotenv from 'dotenv';
import {
  allContractsAreCreated,
  allProductsAreCancelledIfContractIsCancelled,
  allProductsAreDeliveredIfContractIsFinished,
} from './contracts';
import { allInvoicesAreCreated } from './invoices';
import { allProductInstancesWereNotDelivered } from './productInstances';
import { replaceGEWISRecipient } from './GEWISrecipient';
import AppDataSource from '../database';

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
  console.log(`Database validated in ${(new Date().getTime() - t1.getTime())}ms`);
});
