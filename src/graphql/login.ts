import { extendType, FieldResolver, inputObjectType, nonNull, objectType } from 'nexus';
import { CreateUserResponse } from './user';

const mockLoginResult = {
  user: {
    name: 'Mock',
    id: 0,
    email: 'test@test.com',
    birthDate: '04-04-1994',
  },
  token: '000000000000',
};

const loginResolver: FieldResolver<'Mutation', 'login'> = async () => {
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
      type: CreateUserResponse,
    });
    t.string('token');
  },
});
