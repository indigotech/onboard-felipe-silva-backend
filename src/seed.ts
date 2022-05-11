import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { generateHash } from './utils';

const addUsersToDb = async (quantity: number) => {
  await AppDataSource.initialize().then((data) => console.log(`Database Initialized: ${data.isInitialized}`));

  const seedPassword = '123456a';

  for (let i = 0; i < quantity; i++) {
    const user = new User();

    const { salt, hashedPassword } = generateHash(seedPassword);

    const i = 0;
    user.name = `SeedUser-${i}`;
    user.email = `SeedEmail-${i}@mail.com`;
    user.birthDate = `01-01-1990`;
    user.password = hashedPassword;
    user.salt = salt;

    await AppDataSource.manager.save(user);
  }
};

(async () => {
  await addUsersToDb(50);
})();
