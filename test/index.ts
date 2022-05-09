import axios, { AxiosResponse } from 'axios';
import { ApolloServer } from 'apollo-server';
import { schema } from '../src/schema';
import { expect } from 'chai';
import { AppDataSource } from '../src/data-source';
import { initialSetup } from '../src';

const port = process.env.APOLLO_PORT;
const server = new ApolloServer({
  schema,
});

const url = `http://localhost:${port}/`;

before(async () => {
  await initialSetup();
});

describe('Queries Test', () => {
  it('Hello Query', async () => {
    const axiosCall = await axios({
      url,
      method: 'post',
      data: {
        query: `query Query{hello}`,
      },
    });

    const queryResult = axiosCall.data;

    expect(queryResult).to.be.deep.eq({ data: { hello: 'Hello World!' } });
  });
});
