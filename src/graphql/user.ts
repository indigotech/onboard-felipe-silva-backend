import { extendType, inputObjectType, nonNull, objectType } from 'nexus';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';

export const CreateUser = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createUser', {
      type: CreateUserResponse,
      args: {
        data: nonNull(UserInput),
      },

      resolve: async (_parent, args) => {
        const { name, email, birthDate, password } = args.data;

        const user = new User();
        user.name = name;
        user.email = email;
        user.birthDate = birthDate;
        user.password = password;

        return await AppDataSource.manager.save(user);
      },
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
    t.nonNull.int('id');
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.string('birthDate');
  },
});
