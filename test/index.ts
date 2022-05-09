import axios, { AxiosResponse } from 'axios';
import { ApolloError, ApolloServer } from 'apollo-server';
import { schema } from '../src/schema';
import { expect } from 'chai';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { generateHashPasswordFromSalt } from '../src/utils';
import { GraphQLError } from 'graphql';
import { errorsMessages, isInputError } from '../src/error';

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

const port = process.env.APOLLO_PORT;
const server = new ApolloServer({
  schema,
  formatError: (error: GraphQLError) => {
    const originalError = error.originalError;

    if (isInputError(originalError)) {
      return { message: originalError.message, code: originalError.code, additionalInfo: originalError.additionalInfo };
    } else {
      return error;
    }
  },
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
  it('Correct Create Mutation', async () => {
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

  it('Email Already Exists Mutation', async () => {
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
        variables: { credentials: correctInputUser },
      },
    });

    const emailError = {
      message: errorsMessages.existingEmail,
      code: 400,
      additionalInfo: null,
    };

    const errors = createUseMutation.data.errors;

    expect(errors).to.be.an('array').that.deep.includes(emailError);
  });

  it('Weak Password Mutation', async () => {
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
        variables: { credentials: weakPasswordUser },
      },
    });

    const weakPasswordError = {
      code: 400,
      message: errorsMessages.weakPassword,
      additionalInfo: null,
    };

    const errors = createUseMutation.data.errors;

    expect(errors).to.be.an('array').that.deep.includes(weakPasswordError);

    await AppDataSource.manager.delete(User, { email: correctInputUser.email });
  });
});
