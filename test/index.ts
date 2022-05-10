import axios, { AxiosResponse } from 'axios';
import { ApolloError, ApolloServer } from 'apollo-server';
import { schema } from '../src/schema';
import { expect } from 'chai';
import { AppDataSource, server } from '../src/data-source';
import { User } from '../src/entity/User';
import { generateHashPasswordFromSalt } from '../src/utils';
import { GraphQLError } from 'graphql';
import { errorsMessages, isInputError } from '../src/error';

const port = process.env.APOLLO_PORT;

interface UserInput {
  name: string;
  birthDate: string;
  email: string;
  password: string;
}

const correctInputUser: UserInput = {
  name: 'TestUser3',
  birthDate: '09-06-1998',
  email: 'testmail2@test.com',
  password: '1234567abc',
};

const weakPasswordUser: UserInput = {
  name: 'TestUser3',
  birthDate: '09-06-1998',
  email: 'testmailweakpassword@test.com',
  password: '1234567',
};

const query = `
mutation CreateUser($credentials: UserInput!) {
  createUser(data: $credentials) {
    id,
    name,
    email,
    birthDate
  }
}
`;

const createUseMutation = async (credentials: UserInput) => {
  return axios({
    url,
    method: 'post',
    data: {
      query,
      variables: { credentials },
    },
  });
};

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
  it('shoud create user successfully', async () => {
    const createUseMutation = await axios({
      url,
      method: 'post',
      data: {
        query,
        variables: { credentials: correctInputUser },
      },
    });

    const mutationReturn = createUseMutation.data.data.createUser;

    expect({
      email: mutationReturn.email,
      name: mutationReturn.name,
      birthDate: mutationReturn.birthDate,
    }).to.be.deep.eq({
      email: correctInputUser.email,
      name: correctInputUser.name,
      birthDate: correctInputUser.birthDate,
    });
    expect(createUseMutation.data.data.createUser.id).to.exist;

    const testUserFromDatabase = await AppDataSource.manager.findOneBy(User, { email: correctInputUser.email });

    expect(Number.isInteger(testUserFromDatabase.id)).to.be.true;

    const testUserHashedPasword = generateHashPasswordFromSalt(testUserFromDatabase.salt, correctInputUser.password);
    delete testUserFromDatabase.salt;
    delete testUserFromDatabase.id;
    expect(testUserFromDatabase).to.be.deep.eq({
      ...correctInputUser,
      password: testUserHashedPasword,
    });
  });

  it('should return email already exists error', async () => {
    const mutation = await createUseMutation(correctInputUser);

    const emailError = {
      message: errorsMessages.existingEmail,
      code: 400,
      additionalInfo: null,
    };

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([emailError]);
  });

  it('should return weak password error', async () => {
    const mutation = await createUseMutation(weakPasswordUser);

    const weakPasswordError = {
      code: 400,
      message: errorsMessages.weakPassword,
      additionalInfo: null,
    };

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([weakPasswordError]);
  });

  after(async () => {
    await AppDataSource.manager.delete(User, { email: correctInputUser.email });
  });
});

describe('Login Mutation', () => {
  it('User Mutation', async () => {
    const loginCredentials = {
      email: 'test@test.com',
      password: '1234',
    };

    const loginMutation = await axios({
      url,
      method: 'post',
      data: {
        query: `
          mutation Login($credentials: LoginInput!) {
            login(data: $credentials) {
              user {              
                id,
                name,
                email,
                birthDate
              },
              token
            }
          }
        `,
        variables: { credentials: loginCredentials },
      },
    });

    const resultData = loginMutation.data.data.login;

    expect(resultData.token).to.not.be.empty;
  });
});
