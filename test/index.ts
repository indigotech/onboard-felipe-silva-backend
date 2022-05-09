import axios from 'axios';
import { expect } from 'chai';
import { AppDataSource, server } from '../src/data-source';
import { User } from '../src/entity/User';
import { generateHashPasswordFromSalt } from '../src/utils';
import { errorsMessages } from '../src/error';
import { createUserMutation, loginMutation } from './utils';

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

describe('Create User Mutation', () => {
  it('shoud create user successfully', async () => {
    const mutation = await createUserMutation(url, correctInputUser);

    const mutationReturn = mutation.data.data.createUser;

    expect({
      email: mutationReturn.email,
      name: mutationReturn.name,
      birthDate: mutationReturn.birthDate,
    }).to.be.deep.eq({
      email: correctInputUser.email,
      name: correctInputUser.name,
      birthDate: correctInputUser.birthDate,
    });

    expect(mutationReturn.id).to.exist;

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
    const mutation = await createUserMutation(url, correctInputUser);

    const emailError = {
      message: errorsMessages.existingEmail,
      code: 400,
      additionalInfo: null,
    };

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([emailError]);
  });

  it('should return weak password error', async () => {
    const mutation = await createUserMutation(url, weakPasswordUser);

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

    expect(!!resultData.token).to.be.true;
  });
});

describe('Login Mutation', () => {
  it('User Mutation', async () => {
    const loginCredentials = {
      email: 'test@test.com',
      password: '1234',
    };

    const mutation = await loginMutation(url, loginCredentials);

    const resultData = mutation.data.data.login;

    expect(resultData.token).to.not.be.empty;
  });
});
