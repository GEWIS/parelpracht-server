import cron from 'node-cron';
import deferredProducts from './events/deferredProducts';
import tmpFolder from './events/tmpFolder';

export default function startEvents() {
  // On July 1st every year, remove the "Deferred" status from all products
  cron.schedule('0 0 0 1 7 *', async () => {
    await deferredProducts();
  });

  // Every night at 4:30, the "tmp" folder is deleted and recreated to preserve disk space
  cron.schedule('0 29 3 * * *', async () => {
    await tmpFolder();
  });

  console.log('Scheduled timed events');
}
