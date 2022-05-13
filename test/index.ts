import axios from 'axios';
import { expect } from 'chai';
import { AppDataSource, server, jwtTokenSecret } from '../src/data-source';
import { User } from '../src/entity/User';
import { addUsersToDb, generateHashPasswordFromSalt } from '../src/utils';
import { errorsMessages } from '../src/error';
import { createUserMutation, loginMutation, UserInput, userListQuery, userQuery, UserResponse } from './utils';
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

const loginCredentials = {
  email: loginUser.email,
  password: loginUser.password,
  rememberMe: false,
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
  after(async () => {
    await AppDataSource.manager.delete(User, { email: correctInputUser.email });
  });

  it('should create user successfully', async () => {
    const token = sign({ email: loginUser.email }, jwtTokenSecret);
    const mutation = await createUserMutation(url, correctInputUser, token);
    const { id, ...userFields } = mutation.data.data.createUser;
    const testUserFromDatabase = await AppDataSource.manager.findOneBy(User, { email: correctInputUser.email });
    const testUserHashedPasword = generateHashPasswordFromSalt(testUserFromDatabase.salt, correctInputUser.password);

    expect(userFields).to.be.deep.eq({
      email: correctInputUser.email,
      name: correctInputUser.name,
      birthDate: correctInputUser.birthDate,
    });
    expect(Number.isInteger(id)).to.be.true;
    expect(id).to.be.gt(0);
    expect(Number.isInteger(testUserFromDatabase.id)).to.be.true;
    delete testUserFromDatabase.salt;
    expect(testUserFromDatabase).to.be.deep.eq({
      ...correctInputUser,
      password: testUserHashedPasword,
      id,
    });
  });

  it('should return email already exists error', async () => {
    const token = sign({ email: loginUser.email }, jwtTokenSecret);
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
    const token = sign({ email: loginUser.email }, jwtTokenSecret);
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

  before(async () => {
    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: '1d' });

    await createUserMutation(url, loginUser, token);
  });

  after(async () => {
    await AppDataSource.manager.delete(User, { email: loginCredentials.email });
  });

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

describe('test token errors', () => {
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

  it('invalid token', async () => {
    const mutation = await createUserMutation(url, correctInputUser, 'aaaaaa');
    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([unauthorizedError]);
  });

  it('invalid token secret', async () => {
    const token = sign({ email: loginUser.email }, 'wrongSecret', { expiresIn: '1w' });
    const mutation = await createUserMutation(url, correctInputUser, token);
    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([unauthorizedError]);
  });

  it('expired token', async () => {
    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: '1ms' });
    const mutation = await createUserMutation(url, correctInputUser, token);
    const errors = mutation.data.errors;

    expect(errors).to.be.deep.eq([expiredError]);
  });
});

describe('user query', () => {
  let id: number;
  const invalidId = 0;
  let user: UserResponse;

  before(async () => {
    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: '1d' });
    const mutation = await createUserMutation(url, correctInputUser, token);
    id = mutation.data.data.createUser.id;
    const { password, salt, ...userFields } = await AppDataSource.manager.findOneBy(User, { id });
    user = userFields;
  });

  after(async () => {
    await AppDataSource.manager.delete(User, { email: correctInputUser.email });
  });

  const unauthorizedError = {
    message: errorsMessages.unauthorized,
    code: 401,
    additionalInfo: null,
  };

  const userDoesntExistError = {
    message: errorsMessages.userDoesntExist,
    code: 400,
    additionalInfo: null,
  };

  it('enable query after login', async () => {
    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: '1d' });
    const query = await userQuery(url, id, token);

    expect(query.data.data.user).to.be.deep.eq(user);
  });

  it('return error if query without login', async () => {
    const query = await userQuery(url, id, '');

    expect(query.data.errors).to.be.deep.eq([unauthorizedError]);
  });

  it('return error if user does not exist', async () => {
    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: '1d' });
    const query = await userQuery(url, invalidId, token);

    expect(query.data.errors).to.be.deep.eq([userDoesntExistError]);
  });
});

describe('user list query', () => {
  let databaseUsers: User[];

  let users: User[];
  let totalUsers: number;
  before(async () => {
    const repository = AppDataSource.getRepository(User);
    users = await addUsersToDb(50);

    databaseUsers = await repository
      .createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.birthDate', 'user.email'])
      .orderBy('name')
      .getMany();

    totalUsers = databaseUsers.length;
  });

  after(async () => {
    await AppDataSource.manager.delete(User, users);
  });

  it('should return list with length lower than/equal input', async () => {
    const quantity = 5;
    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: '1d' });
    const query = await userListQuery(url, token, quantity);

    if (databaseUsers.length >= 5) {
      expect(query.data.data.users.length).to.be.eq(quantity);
    } else {
      expect(query.data.data.users.length).to.be.lt(quantity);
    }
  });

  it('should return sorted alphabetically', async () => {
    const quantity = 5;
    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: '1d' });
    const query = await userListQuery(url, token, quantity);

    expect(databaseUsers[0]).to.be.deep.eq(query.data.data.users[0]);
  });

  it('should return a valid user list', async () => {
    const limit = 10;

    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: '1d' });
    const query = await userListQuery(url, token, limit);

    expect(query.data.data.users).to.be.deep.eq(databaseUsers.slice(0, limit));
  });

  it('should return 10 users if no has limit parameter', async () => {
    const defaultQuantity = 10;
    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: '1d' });
    const query = await userListQuery(url, token);

    expect(defaultQuantity).to.be.eq(query.data.data.data.users.length);
  });

  it('should returns false for previousPage and true for nextPage when current page is 0', async () => {
    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: '1d' });
    const query = await userListQuery(url, token, 10, 0);

    expect(query.data.data.data.pagination.hasPreviousPage).to.be.false;
    expect(query.data.data.data.pagination.hasNextPage).to.be.true;
  });

  it('should return false to nextPage when reaches at last page', async () => {
    const pageLimit = 10;
    const initialUserFromLastPage = totalUsers - pageLimit;
    const token = sign({ email: loginUser.email }, jwtTokenSecret, { expiresIn: '1d' });
    const query = await userListQuery(url, token, pageLimit, initialUserFromLastPage);

    expect(query.data.data.data.pagination.hasNextPage).to.be.false;
  });
});
