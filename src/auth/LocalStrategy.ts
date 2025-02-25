import { Strategy as LocalStrategy } from 'passport-local';
import crypto from 'crypto';
import passport from 'passport';
import express from 'express';
import validator from 'validator';
import { IdentityLocal } from '../entity/IdentityLocal';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import AppDataSource from '../database';

const INVALID_LOGIN = 'Invalid email or password.';
const VERIFY_ACCOUNT = 'Please verify your account and set your password with the link received by email.';
const ACCOUNT_INACTIVE = 'This account has been deactivated. If this is a mistake, please contact an administrator.';

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password: string, salt: string) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  hash.update(salt);
  return hash.digest('hex');
}

function validPassword(password: string, userSalt: string, userHash: string): boolean {
  return hashPassword(password, userSalt) === userHash;
}

export default new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    const userRepo = AppDataSource.getRepository(User);
    const identityRepo = AppDataSource.getRepository(IdentityLocal);
    const userEmail = validator.normalizeEmail(email);
    if (userEmail === false) {
      return done(new ApiError(HTTPStatus.BadRequest, INVALID_LOGIN));
    }

    const user = await userRepo.findOne({ where: { email: userEmail }, relations: ['roles'] });

    const identity = user != null ? await identityRepo.findOneBy({ id: user.id }) : undefined;

    // Check if the identity is found
    if (identity == null) {
      return done(new ApiError(HTTPStatus.BadRequest, INVALID_LOGIN));
    }
    if (identity.hash == null || identity.salt == null) {
      return done(new ApiError(HTTPStatus.BadRequest, VERIFY_ACCOUNT));
    }

    // Check whether the user account is active
    if (user?.roles.length === 0) {
      return done(new ApiError(HTTPStatus.BadRequest, ACCOUNT_INACTIVE));
    }

    if (!validPassword(password, identity.salt, identity.hash)) {
      return done(new ApiError(HTTPStatus.BadRequest, INVALID_LOGIN));
    }

    const user2 = (await userRepo.findOneBy({ id: identity.id })) || undefined;

    return done(null, user2);
  },
);

export const localLogin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  passport.authenticate('local', (err: any, user: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new ApiError(HTTPStatus.BadRequest, INVALID_LOGIN));
    }
    return req.logIn(user, (e: any) => {
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
