import axios, { AxiosResponse } from 'axios';
import { ApolloServer } from 'apollo-server';
import { schema } from '../src/schema';
import { expect } from 'chai';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';

interface UserInput {
  name: string;
  birthDate: string;
  email: string;
  password: string;
}

interface MutationResponse {
  id: number;
  name: string;
  birthDate: string;
  email: string;
}

const testUser: UserInput = {
  name: 'TestUser3',
  birthDate: '09-06-1998',
  email: 'testmail@test.com',
  password: '1234567a',
};

const port = process.env.APOLLO_PORT;
const server = new ApolloServer({
  schema,
});

let url: string;

const initialSetup = async () => {
  await AppDataSource.initialize().then((data) => console.log(`Database Initialized: ${data.isInitialized}`));

  await server.listen({ port }).then((data) => {
    url = data.url;
    console.log(`Apollo Server Initialized: ${data.url}`);
  });
};

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

describe('Mutation Test', () => {
  it('Create Mutation', async () => {
    const createUseMutation = await axios({
      url,
      method: 'post',
      data: {
        query: `
          mutation CreateUser($credentials: UserInput!) {
            createUser(data: $credentials) {
              id,
              name,
              email,
              birthDate
            }
          }
        `,
        variables: { credentials: testUser },
      },
    });

    expect(createUseMutation.data.data.createUser.email).to.be.eq(testUser.email);
    expect(createUseMutation.data.data.createUser.name).to.be.eq(testUser.name);
    expect(createUseMutation.data.data.createUser.birthDate).to.be.eq(testUser.birthDate);
    expect(!!createUseMutation.data.data.createUser.id).to.exist;
  });
});
