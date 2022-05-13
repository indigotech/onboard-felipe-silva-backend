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

const resolveQueryUserList: FieldResolver<'Query', 'data'> = async (_parent, args, context) => {
  const token = context.headers.authorization;
  verifyToken(token);

  const pageLimit = args.quantity ?? 10;
  const skip = args.offset ?? 0;
  const totalUsersQuantity = await AppDataSource.manager.count(User);

  const totalPages = Math.ceil(totalUsersQuantity / pageLimit);

  const currentPage = Math.floor(skip / pageLimit);

  const users = await AppDataSource.createQueryBuilder(User, 'users')
    .take(pageLimit)
    .skip(skip)
    .orderBy('name')
    .getMany();

  const lastUserPosition = skip + pageLimit;
  const initialUserPosition = skip ?? 0;
  const hasNextPage = lastUserPosition < totalUsersQuantity;
  const hasPreviousPage = initialUserPosition !== 0;
  return {
    users: users,
    pagination: { hasNextPage, hasPreviousPage, totalQuantity: totalUsersQuantity, totalPages, currentPage },
  };
};

export const PaginationResponse = objectType({
  name: 'Pagination',
  definition(t) {
    t.nonNull.boolean('hasNextPage');
    t.nonNull.boolean('hasPreviousPage');
    t.nonNull.int('totalQuantity');
    t.nonNull.int('currentPage');
    t.nonNull.int('totalPages');
  },
});

export const UserListResponse = objectType({
  name: 'UserListResponse',
  definition(t) {
    t.nonNull.list.field('users', {
      type: UserResponse,
    });
    t.nonNull.field('pagination', {
      type: PaginationResponse,
    });
  },
});

export const QueryUserList = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('data', {
      type: UserListResponse,
      args: {
        quantity: intArg(),
        offset: intArg(),
      },
      resolve: resolveQueryUserList,
    });
  },
});
