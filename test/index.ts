import axios from 'axios';
import { ApolloServer } from 'apollo-server';
import { schema } from '../src/schema';

const port = 3030;

const server = new ApolloServer({
  schema,
});

server.listen({ port }).then(({ url }) => {
  console.log(`Server Started - URL: ${url}`);

  axios({
    url,
    method: 'post',
    data: {
      query: `query Query{hello}`,
    },
  })
    .then(console.log)
    .catch(console.log);
});
