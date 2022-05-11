import axios from 'axios';
import { expect } from 'chai';
import { AppDataSource, server } from '../src/data-source';
import { User } from '../src/entity/User';
import { generateHashPasswordFromSalt, jwtTokenSecret } from '../src/utils';
import { errorsMessages } from '../src/error';
import { createUserMutation, loginMutation, UserInput } from './utils';
import { JwtPayload, sign, verify } from 'jsonwebtoken';

const port = process.env.APOLLO_PORT;

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

const loginUser: UserInput = {
  name: 'TestUser3',
  birthDate: '09-06-1998',
  email: 'admin@admin.com',
  password: '1234567a',
};

let url: string;
let token: string;

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
  before(async () => {
    const login = await loginMutation(url, {
      email: loginUser.email,
      password: loginUser.password,
      rememberMe: true,
    });

    token = login.data.data.login.token;
  });

  after(async () => {
    await AppDataSource.manager.delete(User, { email: correctInputUser.email });
  });

  it('should create user successfully', async () => {
    const mutation = await createUserMutation(url, correctInputUser, token);

    const { id, ...userFields } = mutation.data.data.createUser;

    const testUserFromDatabase = await AppDataSource.manager.findOneBy(User, { email: correctInputUser.email });

    const testUserHashedPasword = generateHashPasswordFromSalt(testUserFromDatabase.salt, correctInputUser.password);

    expect(userFields).to.be.deep.eq({
      email: correctInputUser.email,
      name: correctInputUser.name,
      birthDate: correctInputUser.birthDate,
    });

    expect(id).to.exist;
    expect(Number.isInteger(id)).to.be.true;
    expect(id > 0).to.be.true;

    expect(Number.isInteger(testUserFromDatabase.id)).to.be.true;

    delete testUserFromDatabase.salt;

    expect(testUserFromDatabase).to.be.deep.eq({
      ...correctInputUser,
      password: testUserHashedPasword,
      id,
    });
  });

  it('should return email already exists error', async () => {
    const mutation = await createUserMutation(url, correctInputUser, token);

    const emailError = {
      message: errorsMessages.existingEmail,
      code: 400,
      additionalInfo: null,
    };

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([emailError]);
  });

  it('should return weak password error', async () => {
    const mutation = await createUserMutation(url, weakPasswordUser, token);

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

  const loginCredentials = {
    email: loginUser.email,
    password: loginUser.password,
    rememberMe: false,
  };

  it('should enable login', async () => {
    const mutation = await loginMutation(url, loginCredentials);

    expect(mutation.data.data.login.token).to.not.be.empty;
  });

  it('rememberMe should increase expiration time', async () => {
    const loginCredentialsWithRememberMe = {
      email: loginUser.email,
      password: loginUser.password,
      rememberMe: true,
    };

    const mutationWithRemember = await loginMutation(url, loginCredentialsWithRememberMe);

    const verifiedTokenWithRemember = verify(mutationWithRemember.data.data.login.token, jwtTokenSecret) as JwtPayload;

    const expirationWithRemember = verifiedTokenWithRemember.exp - verifiedTokenWithRemember.iat;

    const oneDayInSeconds = 24 * 60 * 60;

    expect(expirationWithRemember > oneDayInSeconds).to.be.true;
  });

  it('should return invalid password error', async () => {
    const userCredentials = {
      email: loginUser.email,
      password: '1234',
    };

    const mutation = await loginMutation(url, userCredentials);

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([invalidInputError]);
  });

  it('should return invalid email error', async () => {
    const userCredentials = {
      email: 'aaaaaaa',
      password: '1234768Aaa',
    };

    const mutation = await loginMutation(url, userCredentials);

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([invalidInputError]);
  });

  it('should return non registered email error', async () => {
    const userCredentials = {
      email: 'emailemail@email.com',
      password: '1234568asA',
    };

    const mutation = await loginMutation(url, userCredentials);

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([unauthorizedError]);
  });

  it('should return wrong password error', async () => {
    const userCredentials = {
      email: loginUser.email,
      password: '1234568asAsd',
    };

    const mutation = await loginMutation(url, userCredentials);

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([unauthorizedError]);
  });
});

describe('test token authorization in create user mutation', () => {
  let loginToken: string;

  const unauthorizedError = {
    code: 401,
    message: errorsMessages.unauthorized,
    additionalInfo: null,
  };

  const expiredError = {
    code: 401,
    message: errorsMessages.expired,
    additionalInfo: null,
  };

  afterEach(async () => {
    await AppDataSource.manager.delete(User, { email: correctInputUser.email });
  });

  it('authorized token', async () => {
    const login = await loginMutation(url, {
      email: loginUser.email,
      password: loginUser.password,
      rememberMe: true,
    });

    const mutation = await createUserMutation(url, correctInputUser, login.data.data.login.token);

    const { id } = mutation.data.data.createUser;

    expect(id).to.exist;
  });

  it('invalid token', async () => {
    const mutation = await createUserMutation(url, correctInputUser, 'aaaaaa');

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([unauthorizedError]);
  });

  it('invalid secret', async () => {
    const token = sign({ email: loginUser.email }, 'wrongSecret', { expiresIn: '1w' });

    const mutation = await createUserMutation(url, correctInputUser, token);

    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([unauthorizedError]);
  });

  it('expired token', async () => {
    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: 2 });

    setTimeout(
      async () => {
        const mutation = await createUserMutation(url, correctInputUser, token);
        const errors = mutation.data.errors;

        expect(errors).to.be.deep.eq([expiredError]);
      },

      3000,
    );
  });
});
