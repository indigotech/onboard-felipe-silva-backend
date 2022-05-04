import { User } from './entity/User';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { schema } from './schema';
import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(async () => {
    console.log('Database Connection Successful');

    console.log('You have these Users in your database:');
    AppDataSource.manager.find(User).then(console.log);
  })
  .catch((error) => console.log(error));

export const server = new ApolloServer({
  schema,
});

const port = 3030;

server.listen({ port }).then(({ url }) => {
  console.log(`Server Started - URL: ${url}`);
});
