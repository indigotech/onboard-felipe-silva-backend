import axios from 'axios';
import { ApolloServer } from 'apollo-server';
import { schema } from '../src/schema';
import assert = require('assert');
const port = 3030;

const server = new ApolloServer({
  schema,
});

server.listen({ port }).then(({ url }) => {
  describe('Axios Call', () => {
    it('Hello', async () => {
      const data = await axios({
        url,
        method: 'post',
        data: {
          query: `query Query{hello}`,
        },
      }).then((result) => {
        return result.status;
      });

      assert.equal(data, 200);
    });
  });
});
