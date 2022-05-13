import { extendType, FieldResolver, inputObjectType, intArg, nonNull, objectType } from 'nexus';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import { errorsMessages, InputError } from '../error';
import { isPasswordValid, generateHash, verifyToken } from '../utils';

const resolveCreateUser: FieldResolver<'Mutation', 'createUser'> = async (_parent, args, context) => {
  const token = context.headers.authorization;

  verifyToken(token);

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
  const token = context.headers.authorization;

  verifyToken(token);

  const user = await AppDataSource.manager.findOneBy(User, { id: args.id });

  if (!user) {
    throw new InputError(errorsMessages.userDoesntExist);
  }

  return user;
};

const resolveQueryUserList: FieldResolver<'Query', 'users'> = async (_parent, args, context) => {
  const token = context.headers.authorization;

  verifyToken(token);

  const repository = AppDataSource.getRepository(User);

  const users = await repository
    .createQueryBuilder('users')
    .take(args.quantity ?? 10)
    .orderBy('name')
    .getMany();

  return users;
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

export const QueryUserList = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('users', {
      type: UserResponse,
      args: {
        quantity: intArg(),
      },
      resolve: resolveQueryUserList,
    });
  },
});
