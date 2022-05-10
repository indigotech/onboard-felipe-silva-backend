import { User } from './entity/User';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { schema } from './schema';
import { AppDataSource, server } from './data-source';
import { GraphQLError } from 'graphql';
import { isInputError } from './error';

AppDataSource.initialize()
  .then(async () => {
    console.log('Database Connection Successful');

    console.log('You have these Users in your database:');
    AppDataSource.manager.find(User).then(console.log);
  })
  .catch((error) => console.log(error));

const port = 3030;

server.listen({ port }).then(({ url }) => {
  console.log(`Server Started - URL: ${url}`);
});
