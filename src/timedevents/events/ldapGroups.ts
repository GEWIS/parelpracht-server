// The @types package from ldapjs is not installed, because it causes
// a conflict in TSOA with passport-ldapauth @types
// @ts-ignore
import { createClient } from 'ldapjs';
import { IdentityLDAP } from '../../entity/IdentityLDAP';
import { updateUserInformation } from '../../auth';
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
    client.search(process.env.LDAP_SEARCHBASE || '', {
      scope: 'one',
      filter: (process.env.LDAP_SEARCHFILTER || '').replace('{{username}}', identity.username),
    }, (err: any, res: any) => {
      res.on('searchEntry', async (entry: any) => {
        await updateUserInformation(identity.user, entry.object);
      });
    });
  });

  console.log('Updated user roles based on LDAP');
}
