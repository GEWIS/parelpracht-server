// @ts-ignore
import { createClient } from 'ldapjs';
import dotenv from 'dotenv';
import { ldapEnabled } from '../../auth';
import AuthService from '../../services/AuthService';

export default async function ldapRoles() {
  dotenv.config();

  if (!ldapEnabled()) return;

  const client = createClient({
    url: process.env.LDAP_URL || '',
    bindDN: process.env.LDAP_BINDDN || '',
    bindCredentials: process.env.LDAP_BINDCREDENTIALS || '',
  });

  const identities = await new AuthService().getAllLdapIdentities();

  identities.forEach((identity) => {
    client.search(process.env.LDAP_SEARCHBASE!, {
      filter: process.env.LDAP_SEARCHFILTER!.replace('username', identity.username),
    }, (error: any, res: any) => {
      if (error) {
        console.error(error);
        return;
      }

      res.on('searchRequest', (searchRequest: any) => {
        console.log('searchRequest: ', searchRequest);
      });
      res.on('searchEntry', (entry: any) => {
        console.log(`entry: ${JSON.stringify(entry.object)}`);
      });
      res.on('searchReference', (referral: any) => {
        console.log(`referral: ${referral.uris.join()}`);
      });
      res.on('error', (err: any) => {
        console.error(`error: ${err.message}`);
      });
      res.on('end', (result: any) => {
        console.log(`status: ${result}`);
      });
    });
  });
}

ldapRoles().then(() => Promise.resolve());
