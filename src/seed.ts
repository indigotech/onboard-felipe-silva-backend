import { initialSetup } from './data-source';
import { addUsersToDb } from './utils';

(async () => {
  await initialSetup();
  await addUsersToDb(50);
})();
