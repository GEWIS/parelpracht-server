import { createClient, LDAPResult, SearchCallbackResponse, SearchEntry, SearchRequest } from 'ldapjs';
import { config } from 'dotenv';
import { ldapEnabled } from '../../auth';
import AuthService from '../../services/AuthService';

export interface SearchReference {
  uris: string[];
}

export default async function ldapRoles() {
  config();

  if (!ldapEnabled()) return;

  const client = createClient({
    url: process.env.LDAP_URL || '',
    bindDN: process.env.LDAP_BINDDN || '',
    bindCredentials: process.env.LDAP_BINDCREDENTIALS || '',
  });

  const identities = await new AuthService().getAllLdapIdentities();

  identities.forEach((identity) => {
    client.search(
      process.env.LDAP_SEARCHBASE!,
      {
        filter: process.env.LDAP_SEARCHFILTER!.replace('username', identity.username),
      },
      (error: Error | null, res: SearchCallbackResponse) => {
        if (error) {
          console.error(error);
          return;
        }

        res.on('searchRequest', (searchRequest: SearchRequest) => {
          console.info('searchRequest: ', searchRequest);
        });
        res.on('searchEntry', (entry: SearchEntry) => {
          console.info(`entry: ${JSON.stringify(entry.object)}`);
        });
        res.on('searchReference', (referral: SearchReference) => {
          console.info(`referral: ${referral.uris.join()}`);
        });
        res.on('error', (err: Error) => {
          console.error(`error: ${err.message}`);
        });
        res.on('end', (result: LDAPResult | null) => {
          console.info(`status: ${JSON.stringify(result)}`);
        });
      },
    );
  });
}

ldapRoles()
  .then(() => Promise.resolve())
  .catch((err) => console.error(err));
