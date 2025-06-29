import { createClient, SearchCallbackResponse, SearchEntry } from 'ldapjs';
import { IdentityLDAP } from '../../entity/IdentityLDAP';
import { LDAPUser, updateUserInformation } from '../../auth';
import AppDataSource from '../../database';

export default async function ldapGroups() {
  const identities = await AppDataSource.getRepository(IdentityLDAP).find({
    relations: ['user', 'user.identityLdap'],
  });

  const client = createClient({
    url: process.env.LDAP_URL || '',
    bindDN: process.env.LDAP_BINDDN || '',
    bindCredentials: process.env.LDAP_BINDCREDENTIALS || '',
  });

  identities.forEach((identity) => {
    client.search(
      process.env.LDAP_SEARCHBASE || '',
      {
        scope: 'one',
        filter: (process.env.LDAP_SEARCHFILTER || '').replace('{{username}}', identity.username),
      },
      (err: Error | null, res: SearchCallbackResponse) => {
        if (err) {
          console.error(err);
          return;
        }

        res.on('searchEntry', (entry: SearchEntry) => {
          // TODO check if there is a better way to cast this type
          updateUserInformation(identity.user, entry.object as unknown as LDAPUser).catch((err) => console.error(err));
        });
      },
    );
  });

  console.info('Updated user roles based on LDAP');
}
