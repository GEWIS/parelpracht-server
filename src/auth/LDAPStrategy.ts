import Strategy from 'passport-ldapauth';
import express from 'express';
import passport from 'passport';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import { IdentityLDAP } from '../entity/IdentityLDAP';
import { Role } from '../entity/Role';
import UserService from '../services/UserService';
import { Roles } from '../entity/enums/Roles';
import AppDataSource from '../database';
import { ExpressRequest } from '../types';

const isDefined = (i: string | undefined) => i !== undefined && i !== '';

export interface LDAPUser {
  sAMAccountName: string;
  memberOfFlattened: string[];
  memberOf: string[];
  mail: string;
  givenName: string;
  sn: string;
}

interface AuthInfo {
  message: string;
}

export const ldapEnabled = () =>
  isDefined(process.env.LDAP_URL) &&
  isDefined(process.env.LDAP_BINDDN) &&
  isDefined(process.env.LDAP_BINDCREDENTIALS) &&
  isDefined(process.env.LDAP_SEARCHBASE) &&
  isDefined(process.env.LDAP_SEARCHFILTER);

export const LDAPStrategy = new Strategy({
  server: {
    url: process.env.LDAP_URL || '',
    bindDN: process.env.LDAP_BINDDN || '',
    bindCredentials: process.env.LDAP_BINDCREDENTIALS || '',
    searchBase: process.env.LDAP_SEARCHBASE || '',
    searchFilter: process.env.LDAP_SEARCHFILTER || '',
  },
});

const checkAllowedRoles = async (ldapUser: LDAPUser): Promise<Roles[]> => {
  const roles = await AppDataSource.getRepository(Role).find();
  const userRoles: Roles[] = [];
  roles.forEach((role) => {
    if (ldapUser.memberOfFlattened.includes(role.ldapGroup)) {
      userRoles.push(role.name as Roles);
    }
  });
  return userRoles;
};

export const updateUserInformation = async (user: User, ldapUser: LDAPUser): Promise<User> => {
  const userRoles = await checkAllowedRoles(ldapUser);
  await new UserService().assignRoles(user, userRoles);

  const identity = user.identityLdap;

  if (identity && !identity.overrideEmail) user.email = ldapUser.mail;

  user.firstName = ldapUser.givenName;

  user.lastName = ldapUser.sn;
  return user.save();
};

export const ldapLogin = (req: ExpressRequest, res: express.Response, next: express.NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- this seems to be correct
  passport.authenticate('ldapauth', async (err: Error, ldapUser: LDAPUser, info: AuthInfo) => {
    if (err) {
      return next(err);
    }
    if (!ldapUser) {
      return next(new ApiError(HTTPStatus.BadRequest, info.message));
    }

    const userRoles = await checkAllowedRoles(ldapUser);
    if (userRoles.length === 0)
      return next(
        new ApiError(HTTPStatus.Forbidden, "You don't have the required LDAP groups to be allowed to login."),
      );

    const userRepo = AppDataSource.getRepository(User);
    const identityRepo = AppDataSource.getRepository(IdentityLDAP);

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
      } as User;
      user = await userRepo.save(user);

      identity = {
        id: user.id,
        username: ldapUser.sAMAccountName,
      } as IdentityLDAP;
      identity = await identityRepo.save(identity);
      identity = await identityRepo.findOne({
        where: { id: identity.id },
        relations: ['user', 'user.roles'],
      });
      if (!identity) throw new Error('Identity is still undefined after saving it to database');
    }

    identity.lastLogin = new Date();
    await identityRepo.save(identity);

    await updateUserInformation(identity.user, ldapUser);

    return req.logIn(identity.user, (e: Error) => {
      // When the user enabled "remember me", we give the session cookie an
      // expiration date of 30 days
      if (req.body.rememberMe === true) {
        req.session.cookie.maxAge = 2592000000; // 30 * 24 * 60 * 60 * 1000 (30 days)
        // Otherwise, just create it as a temporary session cookie
      } else {
        req.session.cookie.maxAge = undefined;
      }
      if (e) {
        return next(e);
      }
      return res.send();
    });
  })(req, res, next);
};
