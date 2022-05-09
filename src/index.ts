import { User } from './entity/User';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { schema } from './schema';
import { AppDataSource } from './data-source';

const port = 3030;

export const server = new ApolloServer({
  schema,
});
export const initialSetup = async () => {
  await AppDataSource.initialize().then((data) => console.log(`Database Initialized: ${data.isInitialized}`));

  await server.listen({ port }).then((data) => {
    console.log(`Apollo Server Initialized: ${data.url}`);
  });
};
