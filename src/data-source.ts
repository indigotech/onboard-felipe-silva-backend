import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { config } from 'dotenv';
import path = require('path');
import { ApolloServer } from 'apollo-server';
import { GraphQLError } from 'graphql';
import { isAuthorizationError, isInputError } from './error';
import { schema } from './schema';

let env_prefix: string = '';

if (process.env.APP_ENV === 'test') {
  env_prefix = 'test';
}

config({
  path: path.resolve(__dirname, `../${env_prefix}.env`),
});

export const jwtTokenSecret = process.env.TOKEN_SECRET;

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

export const server = new ApolloServer({
  schema,
  context: ({ req }) => ({ headers: req.headers }),
  formatError: (error: GraphQLError) => {
    const originalError = error.originalError;

    if (isInputError(originalError) || isAuthorizationError(originalError)) {
      return { message: originalError.message, code: originalError.code, additionalInfo: originalError.additionalInfo };
    } else {
      return error;
    }
  },
});

export const initialSetup = async () => {
  const data = await AppDataSource.initialize();

  console.log(`Database Initialized: ${data.isInitialized}`);

  const apolloData = await server.listen({ port: process.env.APOLLO_PORT });

  console.log(`Apollo Server Initialized: ${apolloData.url}`);
};
