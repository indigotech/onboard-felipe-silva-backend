import { extendType, FieldResolver, inputObjectType, nonNull, objectType } from 'nexus';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import keccak256 = require('keccak256');

const resolveCreateUser: FieldResolver<'Mutation', 'createUser'> = async (_parent, args) => {
  const { name, email, birthDate, password } = args.data;

  const user = new User();
  const isPasswordStrong: boolean = handlePasswordValidation(password);

  if (!isPasswordStrong) {
    throw new Error('Weak password. It needs at least 6 characters, one letter and one digit!');
  }

  const existingUser = await AppDataSource.manager.findOneBy(User, { email });
  const thisUserAlreadyExists = existingUser !== null;

  if (thisUserAlreadyExists) {
    throw new Error('This e-mail is already in use.');
  }

  const { salt, hashedPassword } = generateHash(name, email, password);

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
      type: CreateUserResponse,
      args: {
        data: nonNull(UserInput),
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

export const CreateUserResponse = objectType({
  name: 'CreateUserResponse',
  definition(t) {
    t.int('id');
    t.string('name');
    t.string('email');
    t.string('birthDate');
    t.string('error');
  },
});
