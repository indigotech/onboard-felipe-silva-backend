import { DataSource } from 'typeorm';
import { AppDataSource } from './data-source';

export interface Context {
  typeorm: DataSource;
}

export const context: Context = {
  typeorm: AppDataSource,
};
