import axios from 'axios';
import { ApolloServer } from 'apollo-server';
import { schema } from '../src/schema';
const port = 3030;
import { expect } from 'chai';

const server = new ApolloServer({
  schema,
});

server.listen({ port }).then(({ url }) => {
  describe('Axios Call', () => {
    it('Hello World!', async () => {
      const queryValue = await axios({
        url,
        method: 'post',
        data: {
          query: `query Query{hello}`,
        },
      }).then((result) => {
        return result.data.data.hello;
      });

      expect(queryValue).to.be.eq('Hello World!');
    });

    assert.equal(data, 200);
  });
});
