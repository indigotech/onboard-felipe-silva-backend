import { extendType, FieldResolver, inputObjectType, nonNull, objectType } from 'nexus';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { errorsMessages, InputError } from '../error';
import { generateHashPasswordFromSalt, isEmailValid, isPasswordValid } from '../utils';
import { CreateUserResponse } from './user';
import { sign } from 'jsonwebtoken';

const generateToken = (email: string, rememberMe: boolean) => {
  const token = sign({ email: email }, 'supersecret', { expiresIn: rememberMe ? '1w' : '1d' });
  return token;
};

const loginResolver: FieldResolver<'Mutation', 'login'> = async (_parent, args) => {
  if (!isPasswordValid(args.data.password) || !isEmailValid(args.data.email)) {
    throw new InputError(400, errorsMessages.invalidInput);
  }

  const user = await AppDataSource.manager.findOneBy(User, { email: args.data.email });

  if (!user) {
    throw new InputError(401, errorsMessages.invalidInput);
  }

  const password = generateHashPasswordFromSalt(user.salt, args.data.password);

  if (password !== user.password) {
    throw new InputError(401, errorsMessages.invalidInput);
  }

  const token = generateToken(user.email, args.data.rememberMe);

  return { user, token };
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
    t.nonNull.boolean('rememberMe');
  },
});

export const LoginResponse = objectType({
  name: 'login',
  definition(t) {
    t.field('user', {
      type: CreateUserResponse,
    });
    t.string('token');
  },
});
