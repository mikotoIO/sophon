import { boot, sophon } from './sophon';

boot(3000, () => {
  console.log('listening on *:3000');
});
