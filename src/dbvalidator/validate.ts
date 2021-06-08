import { ConnectionOptions, createConnection } from 'typeorm';
import dotenv from 'dotenv';
import {
  allContractsAreCreated,
  allProductsAreCancelledIfContractIsCancelled,
  allProductsAreDeliveredIfContractIsFinished
} from './contracts';
import { allInvoicesAreCreated } from './invoices';
import { allProductInstancesWereNotDelivered } from './productInstances';

dotenv.config({ path: '.env' });

createConnection({
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  database: process.env.TYPEORM_DATABASE,
  type: process.env.TYPEORM_CONNECTION as 'postgres' | 'mariadb' | 'mysql',
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  synchronize: process.env.TYPEORM_SYNCHRONIZE,
  logging: process.env.TYPEORM_LOGGING,
  entities: [process.env.TYPEORM_ENTITIES],
  subscribers: [process.env.TYPEORM_SUBSCRIBERS],
  migrations: [process.env.TYPEORM_MIGRATIONS],
  extra: {
    authPlugins: {
      mysql_clear_password: () => () => {
        return Buffer.from(`${process.env.TYPEORM_PASSWORD}\0`);
      },
    },
  },
} as ConnectionOptions).then(async (connection) => {
  const t1 = new Date();
  console.log('Start database validation...');
  await Promise.all([
    allContractsAreCreated(connection),
    allInvoicesAreCreated(connection),
    allProductInstancesWereNotDelivered(connection),
    allProductsAreCancelledIfContractIsCancelled(connection),
    allProductsAreDeliveredIfContractIsFinished(connection),
  ]);
  console.log(`Database validated in ${(new Date().getTime() - t1.getTime())}ms`);
});
