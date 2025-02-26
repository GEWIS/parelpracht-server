import { schedule } from 'node-cron';
import { ldapEnabled } from '../auth';
import deferredProducts from './events/deferredProducts';
import tmpFolder from './events/tmpFolder';
import directMail from './events/directMail';
import ldapGroups from './events/ldapGroups';

export default function startEvents() {
  // On July 1st every year, remove the "Deferred" status from all products
  schedule('0 0 0 1 7 *', () => {
    deferredProducts().catch((err) => console.error(err));
  });

  // Every night at 4:30, the "tmp" folder is deleted and recreated to preserve disk space
  schedule('0 29 3 * * *', () => {
    tmpFolder().catch((err) => console.error(err));
  });

  // Every night at 4:30, fetch the current DirectMail information and process it
  schedule('0 29 3 * * *', () => {
    directMail().catch((err) => console.error(err));
  });

  // Every night at 4:30, update all user roles from LDAP if LDAP is enabled
  schedule('0 29 3 * * *', () => {
    if (ldapEnabled()) ldapGroups().catch((err) => console.error(err));
  });

  console.warn('Scheduled timed events');
}
