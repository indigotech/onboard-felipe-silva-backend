import { extendType, FieldResolver, inputObjectType, nonNull, objectType } from 'nexus';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { AuthorizationError, errorsMessages, InputError } from '../error';
import { generateHashPasswordFromSalt, isEmailValid, isPasswordValid } from '../utils';
import { UserResponse } from './user';

const mockLoginResult = {
  user: {
    name: 'Mock',
    id: 0,
    email: 'test@test.com',
    birthDate: '04-04-1994',
  },
  token: ' ',
};

const loginResolver: FieldResolver<'Mutation', 'login'> = async (_parent, args) => {
  if (!isPasswordValid(args.data.password) || !isEmailValid(args.data.email)) {
    throw new InputError(errorsMessages.invalidInput);
  }

  const user = await AppDataSource.manager.findOneBy(User, { email: args.data.email });

  if (!user) {
    throw new AuthorizationError(errorsMessages.invalidInput);
  }

  const password = generateHashPasswordFromSalt(user.salt, args.data.password);

  if (password !== user.password) {
    throw new AuthorizationError(errorsMessages.invalidInput);
  }

  return mockLoginResult;
};

export const Login = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('login', {
      type: LoginResponse,
      args: {
        data: nonNull(LoginInput),
      },

      resolve: loginResolver,
    });
  },
});

export const LoginInput = inputObjectType({
  name: 'LoginInput',
  definition(t) {
    t.nonNull.string('password');
    t.nonNull.string('email');
  },
});

export const LoginResponse = objectType({
  name: 'login',
  definition(t) {
    t.field('user', {
      type: UserResponse,
    });
    t.string('token');
  },
});
