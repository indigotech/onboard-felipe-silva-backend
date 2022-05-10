import 'reflect-metadata';
import { AppDataSource, server } from './data-source';
import { User } from './entity/User';

export const initialSetup = async () => {
  await AppDataSource.initialize().then((data) => console.log(`Database Initialized: ${data.isInitialized}`));

  await server.listen({ port }).then((data) => {
    console.log(`Apollo Server Initialized: ${data.url}`);
  });
};

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
