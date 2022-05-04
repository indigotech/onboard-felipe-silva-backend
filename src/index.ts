import { User } from './entity/User';
import { DataSource } from 'typeorm';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { schema } from './schema';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'pimsil_local',
  password: '1234',
  database: 'pimsil_db_local',
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});

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
