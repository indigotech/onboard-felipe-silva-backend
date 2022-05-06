import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { config } from 'dotenv';
import path = require('path');

let env_prefix: string = '';

if (process.env.APP_ENV === 'test') {
  env_prefix = 'test';
}

config({
  path: path.resolve(__dirname, `../${env_prefix}.env`),
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: Number(process.env.PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
