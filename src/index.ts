import 'reflect-metadata';
import { AppDataSource, server } from './data-source';

export const initialSetup = async () => {
  await AppDataSource.initialize().then((data) => console.log(`Database Initialized: ${data.isInitialized}`));

  await server.listen({ port }).then((data) => {
    console.log(`Apollo Server Initialized: ${data.url}`);
  });
};
const port = 3030;

server.listen({ port }).then(({ url }) => {
  console.log(`Server Started - URL: ${url}`);
});
