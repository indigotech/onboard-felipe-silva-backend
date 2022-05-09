import axios, { AxiosResponse } from 'axios';
import { ApolloServer } from 'apollo-server';
import { schema } from '../src/schema';
import { expect } from 'chai';
import { AppDataSource } from '../src/data-source';
<<<<<<< HEAD
import { initialSetup } from '../src';
=======
import { User } from '../src/entity/User';
import { generateHashPasswordWithSalt } from '../src/utils';

interface UserInput {
  name: string;
  birthDate: string;
  email: string;
  password: string;
}

const testUser: UserInput = {
  name: 'TestUser3',
  birthDate: '09-06-1998',
  email: 'testmail@test.com',
  password: '1234567a',
};
>>>>>>> ffae8d4 (test create mutation)

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

    expect({
      email: createUseMutation.data.data.createUser.email,
      name: createUseMutation.data.data.createUser.name,
      birthDate: createUseMutation.data.data.createUser.birthDate,
    }).to.be.deep.eq({
      email: testUser.email,
      name: testUser.name,
      birthDate: testUser.birthDate,
    });

    expect(createUseMutation.data.data.createUser.id).to.exist;

    const testUserFromDatabase = await AppDataSource.manager.findOneBy(User, { email: testUser.email });

    expect(Number.isInteger(testUserFromDatabase.id)).to.be.eq(true);

    delete testUserFromDatabase.id;
    const testUserHashedPasword = generateHashPasswordWithSalt(testUserFromDatabase.salt, testUser.password);
    delete testUserFromDatabase.salt;

    expect(testUserFromDatabase).to.be.deep.eq({
      ...testUser,
      password: testUserHashedPasword,
    });

    await AppDataSource.manager.delete(User, { email: testUser.email });
  });
});
