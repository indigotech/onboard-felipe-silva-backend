import { User } from './entity/User';
import { DataSource } from 'typeorm';
import 'reflect-metadata';
// import { ApolloServer } from 'apollo-server';
// import { schema } from './schema';

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
  })
  .catch((error) => console.log(error));

//APOLLO SERVER CONNECTION TO USE LATER
// export const server = new ApolloServer({
//   schema,
// });

// const port = 3030;

// server.listen({ port }).then(({ url }) => {
//   console.log(`Server Started - URL: ${url}`);
// });
