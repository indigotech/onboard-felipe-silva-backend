import axios from 'axios';
import { ApolloServer } from 'apollo-server';
import { schema } from '../src/schema';
import assert = require('assert');
const port = 3030;

const server = new ApolloServer({
  schema,
});

describe('Axios Call', () => {
  let connectedUrl: string;
  before(async () => {
    const { url } = await server.listen({ port });
    connectedUrl = url;
  });

  it('Hello', async () => {
    const data = await axios({
      url: connectedUrl,
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
