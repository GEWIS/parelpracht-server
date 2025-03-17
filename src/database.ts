import fs from 'fs';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Company } from './entity/Company';
import { Contact } from './entity/Contact';
import { Contract } from './entity/Contract';
import { IdentityApiKey } from './entity/IdentityApiKey';
import { IdentityLDAP } from './entity/IdentityLDAP';
import { IdentityLocal } from './entity/IdentityLocal';
import { Invoice } from './entity/Invoice';
import { Product } from './entity/Product';
import { ProductCategory } from './entity/ProductCategory';
import { ProductInstance } from './entity/ProductInstance';
import { ProductPricing } from './entity/ProductPricing';
import { Role } from './entity/Role';
import { ServerSetting } from './entity/ServerSetting';
import { Session } from './entity/Session';
import { User } from './entity/User';
import { ValueAddedTax } from './entity/ValueAddedTax';
import { CompanyActivity } from './entity/activity/CompanyActivity';
import { ContractActivity } from './entity/activity/ContractActivity';
import { InvoiceActivity } from './entity/activity/InvoiceActivity';
import { ProductActivity } from './entity/activity/ProductActivity';
import { ProductInstanceActivity } from './entity/activity/ProductInstanceActivity';
import { CompanyFile } from './entity/file/CompanyFile';
import { ContractFile } from './entity/file/ContractFile';
import { InvoiceFile } from './entity/file/InvoiceFile';
import { ProductFile } from './entity/file/ProductFile';

config();

const AppDataSource = new DataSource({
  host: process.env.TYPEORM_HOST,
  port: parseInt(process.env.TYPEORM_PORT || '3001'),
  database: process.env.TYPEORM_DATABASE,
  type: process.env.TYPEORM_CONNECTION as 'postgres' | 'mariadb' | 'mysql',
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  ...(process.env.TYPEORM_SSL_ENABLED === 'true' && process.env.TYPEORM_SSL_CACERTS
    ? {
        ssl: {
          ca: fs.readFileSync(process.env.TYPEORM_SSL_CACERTS),
        },
      }
    : {}),
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [
    Company,
    Contact,
    Contract,
    IdentityApiKey,
    IdentityLDAP,
    IdentityLocal,
    Invoice,
    Product,
    ProductCategory,
    ProductInstance,
    ProductPricing,
    Role,
    ServerSetting,
    Session,
    User,
    ValueAddedTax,
    CompanyActivity,
    ContractActivity,
    InvoiceActivity,
    ProductActivity,
    ProductInstanceActivity,
    CompanyFile,
    ContractFile,
    InvoiceFile,
    ProductFile,
  ],
  subscribers: [process.env.TYPEORM_SUBSCRIBERS!],
  migrations: [process.env.TYPEORM_MIGRATIONS!],
  extra: {
    authPlugins: {
      mysql_clear_password: () => () => {
        return Buffer.from(`${process.env.TYPEORM_PASSWORD}\0`);
      },
    },
  },
});

export default AppDataSource;
