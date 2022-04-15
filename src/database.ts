import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  host: process.env.TYPEORM_HOST,
  port: parseInt(process.env.TYPEORM_PORT || '3001'),
  database: process.env.TYPEORM_DATABASE,
  type: process.env.TYPEORM_CONNECTION as 'postgres' | 'mariadb' | 'mysql',
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [process.env.TYPEORM_ENTITIES!],
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
