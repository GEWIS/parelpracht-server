import Strategy from 'passport-ldapauth';
import { getRepository } from 'typeorm';
import express from 'express';
import passport from 'passport';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import { IdentityLDAP } from '../entity/IdentityLDAP';
import { Role } from '../entity/Role';
import UserService from '../services/UserService';
import { Roles } from '../entity/enums/Roles';

const isDefined = (i: string | undefined) => (i !== undefined && i !== '');

export const ldapEnabled = () => (isDefined(process.env.LDAP_URL)
  && isDefined(process.env.LDAP_BINDDN)
  && isDefined(process.env.LDAP_BINDCREDENTIALS)
  && isDefined(process.env.LDAP_SEARCHBASE)
  && isDefined(process.env.LDAP_SEARCHFILTER));

export const LDAPStrategy = new Strategy({
  server: {
    url: process.env.LDAP_URL || '',
    bindDN: process.env.LDAP_BINDDN || '',
    bindCredentials: process.env.LDAP_BINDCREDENTIALS || '',
    searchBase: process.env.LDAP_SEARCHBASE || '',
    searchFilter: process.env.LDAP_SEARCHFILTER || '',
  },
});

export const ldapLogin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  passport.authenticate('ldapauth', async (err, ldapUser, info) => {
    if (err) { return next(err); }
    if (!ldapUser) { return next(new ApiError(HTTPStatus.BadRequest, info.message)); }

    const userRepo = getRepository(User);
    const identityRepo = getRepository(IdentityLDAP);

    let identity = await identityRepo.findOne({
      where: {
        username: ldapUser.sAMAccountName,
      },
      relations: ['user', 'user.roles'],
    });

    if (!identity) {
      let user = {
        firstName: ldapUser.givenName,
        lastName: ldapUser.sn,
        email: ldapUser.mail,
        function: '',
      } as any as User;
      user = await userRepo.save(user);

      identity = {
        id: user.id,
        username: ldapUser.sAMAccountName,
      } as any as IdentityLDAP;
      identity = await identityRepo.save(identity);
      identity = await identityRepo.findOne(identity.id, {
        relations: ['user', 'user.roles'],
      });
      if (!identity) throw new Error('Identity is still undefined after saving it to database');
    }

    identity.lastLogin = new Date();
    await identityRepo.save(identity);

    const roles = await getRepository(Role).find();
    const userRoles: Roles[] = [];
    roles.forEach((role) => {
      if (ldapUser.memberOfFlattened.includes(role.ldapGroup)) {
        userRoles.push(role.name as Roles);
      }
    });

    await (new UserService()).assignRoles(identity.user, userRoles);

    return req.logIn(identity.user, (e: any) => {
      // When the user enabled "remember me", we give the session cookie an
      // expiration date of 30 days
      if (req.body.rememberMe === true) {
        req.session.cookie.maxAge = 2592000000; // 30 * 24 * 60 * 60 * 1000 (30 days)
        // Otherwise, just create it as a temporary session cookie
      } else {
        req.session.cookie.maxAge = undefined;
      }
      if (e) { return next(e); }
      return res.send();
    });
  })(req, res, next);
};
