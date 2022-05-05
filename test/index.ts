import axios, { AxiosResponse } from 'axios';
import { ApolloServer } from 'apollo-server';
import { schema } from '../src/schema';
import { expect } from 'chai';
import { AppDataSource } from '../src/data-source';

const port = 3030;
const server = new ApolloServer({
  schema,
});

(async () => {
  describe('DataSource Initiation', async () => {
    AppDataSource.initialize();

    before(() => {
      AppDataSource.initialize();
    });

    let connectedUrl: string;
    before(async () => {
      const { url } = await server.listen({ port });
      connectedUrl = url;
    });

    it('Server Connected', () => expect(connectedUrl).to.be.eq('http://localhost:3030/'));

    let queryResult: string;
    before(async () => {
      const axiosCall = await axios({
        url: connectedUrl,
        method: 'post',
        data: {
          query: `query Query{hello}`,
        },
      });

      queryResult = axiosCall.data.data.hello;
    });

    it('Query Result', () => expect(queryResult).to.be.eq('Hello World!'));
  });
})();
