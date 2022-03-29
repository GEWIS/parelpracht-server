import cron from 'node-cron';
import deferredProducts from './events/deferredProducts';
import tmpFolder from './events/tmpFolder';
import directMail from './events/directMail';
import ldapGroups from './events/ldapGroups';
import { ldapEnabled } from '../auth';

export default function startEvents() {
  // On July 1st every year, remove the "Deferred" status from all products
  cron.schedule('0 0 0 1 7 *', async () => {
    await deferredProducts();
  });

  // Every night at 4:30, the "tmp" folder is deleted and recreated to preserve disk space
  cron.schedule('0 29 3 * * *', async () => {
    await tmpFolder();
  });

  // Every night at 4:30, fetch the current DirectMail information and process it
  cron.schedule('0 29 3 * * *', async () => {
    await directMail();
  });

  // Every night at 4:30, update all user roles from LDAP if LDAP is enabled
  cron.schedule('0 29 3 * * *', async () => {
    if (ldapEnabled()) await ldapGroups();
  });

  console.log('Scheduled timed events');
}
