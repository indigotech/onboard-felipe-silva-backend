import { extendType, FieldResolver, inputObjectType, intArg, nonNull, objectType } from 'nexus';
import { User } from '../entity/User';
import { AppDataSource, jwtTokenSecret } from '../data-source';
import { isPasswordValid, generateHash } from '../utils';
import { AuthorizationError, errorsMessages, InputError } from '../error';
import { JsonWebTokenError, JwtPayload, TokenExpiredError, verify } from 'jsonwebtoken';

const resolveCreateUser: FieldResolver<'Mutation', 'createUser'> = async (_parent, args, context) => {
  const token = context.headers.authorization;

  try {
    verify(token, jwtTokenSecret) as JwtPayload;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new AuthorizationError(errorsMessages.expired);
    } else if (err instanceof JsonWebTokenError) {
      throw new AuthorizationError(errorsMessages.unauthorized);
    }
  }

  const { name, email, birthDate, password } = args.user;

  const user = new User();
  const isPasswordStrong: boolean = isPasswordValid(password);

  if (!isPasswordStrong) {
    throw new InputError(errorsMessages.weakPassword);
  }

  const existingUser = await AppDataSource.manager.findOneBy(User, { email });
  const thisUserAlreadyExists = existingUser !== null;

  if (thisUserAlreadyExists) {
    throw new InputError(errorsMessages.existingEmail);
  }

  const { salt, hashedPassword } = generateHash(password);

  user.name = name;
  user.email = email;
  user.birthDate = birthDate;
  user.password = hashedPassword;
  user.salt = salt;

  return AppDataSource.manager.save(user);
};

export const CreateUser = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createUser', {
      type: UserResponse,
      args: {
        user: nonNull(UserInput),
      },

      resolve: resolveCreateUser,
    });
  },
});

export const UserInput = inputObjectType({
  name: 'UserInput',
  definition(t) {
    t.nonNull.string('password');
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.string('birthDate');
  },
});

export const UserResponse = objectType({
  name: 'UserResponse',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.string('birthDate');
  },
});

const resolveQueryUser: FieldResolver<'Query', 'user'> = async (_parent, args, context) => {
  const token = context.req.headers.authorization;

  verify(token, jwtTokenSecret, (error: VerifyErrors, decodedToken: JwtPayload) => {
    if (!!error) {
      throw new AuthorizationError(errorsMessages.unauthorized);
    }

    if (decodedToken.exp < Date.now() / 1000) {
      throw new AuthorizationError(errorsMessages.expired);
    }
  });

  const user = await AppDataSource.manager.findOneBy(User, { id: args.id });

  if (!user) {
    throw new InputError(errorsMessages.userDoesntExist);
  }

  return user;
};

export const QueryUser = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('user', {
      type: UserResponse,
      args: {
        id: nonNull(intArg()),
      },
      resolve: resolveQueryUser,
    });
  },
});
