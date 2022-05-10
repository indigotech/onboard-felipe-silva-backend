import axios from 'axios';
import { expect } from 'chai';
import { AppDataSource, server } from '../src/data-source';
import { User } from '../src/entity/User';
import { generateHashPasswordFromSalt } from '../src/utils';
import { errorsMessages } from '../src/error';
import { createUserMutation, loginMutation } from './utils';
import { JwtPayload, verify } from 'jsonwebtoken';

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
    expect(Number.isInteger(mutationReturn.id)).to.be.true;
    expect(mutationReturn.id > 0).to.be.true;

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
});

describe('Login Mutation', () => {
  const invalidInputError = {
    message: errorsMessages.invalidInput,
    code: 400,
    additionalInfo: null,
  };

  const unauthorizedError = {
    message: errorsMessages.invalidInput,
    code: 401,
    additionalInfo: null,
  };

  after(async () => {
    await AppDataSource.manager.delete(User, { email: correctInputUser.email });
  });

  it('should enable login', async () => {
    await createUserMutation(url, correctInputUser);

    const loginCredentials = {
      email: correctInputUser.email,
      password: correctInputUser.password,
      rememberMe: false,
    };

    const mutation = await loginMutation(url, loginCredentials);

    const resultData = mutation.data.data.login;

    expect(resultData.token).to.not.be.empty;
  });

  it('should return invalid password error', async () => {
    const userCredentials = {
      email: correctInputUser.email,
      password: '1234',
      rememberMe: false,
    };

    const mutation = await loginMutation(url, userCredentials);

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([invalidInputError]);
  });

  it('should return invalid email error', async () => {
    const userCredentials = {
      email: 'aaaaaaa',
      password: '1234768Aaa',
      rememberMe: false,
    };

    const mutation = await loginMutation(url, userCredentials);

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([invalidInputError]);
  });

  it('should return non registered email error', async () => {
    const userCredentials = {
      email: 'emailemail@email.com',
      password: '1234568asA',
      rememberMe: false,
    };

    const mutation = await loginMutation(url, userCredentials);

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([unauthorizedError]);
  });

  it('should return wrong password error', async () => {
    const userCredentials = {
      email: correctInputUser.email,
      password: '1234568asAsd',
      rememberMe: false,
    };

    const mutation = await loginMutation(url, userCredentials);

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([unauthorizedError]);
  });
});
