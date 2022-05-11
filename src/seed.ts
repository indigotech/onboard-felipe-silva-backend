import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { generateHash } from './utils';
import { faker } from '@faker-js/faker';

const dateFormatter = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const addUsersToDb = async (quantity: number) => {
  await AppDataSource.initialize().then((data) => console.log(`Database Initialized: ${data.isInitialized}`));

  const seedPassword = '123456a';

  for (let i = 0; i < quantity; i++) {
    const user = new User();

    const { salt, hashedPassword } = generateHash(seedPassword);

    user.name = faker.name.findName();
    user.email = faker.internet.email();
    user.birthDate = dateFormatter(faker.date.past());
    user.password = hashedPassword;
    user.salt = salt;

    await AppDataSource.manager.save(user);
  }
};

addUsersToDb(50);
