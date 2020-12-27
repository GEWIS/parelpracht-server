import { Strategy as LocalStrategy } from 'passport-local';
import { getRepository } from 'typeorm';
import crypto from 'crypto';
import passport from 'passport';
import express from 'express';
import { IdentityLocal } from '../entity/IdentityLocal';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';

const INVALID_LOGIN = 'Invalid email or password.';
const VERIFY_ACCOUNT = 'Please verify your account and set your password with the link received by email.';

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

export default new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  const identityRepo = getRepository(IdentityLocal);

  const identity = await identityRepo.findOne({ email });

  // Check if the identity is found
  if (identity === undefined) { return done(new ApiError(HTTPStatus.BadRequest, INVALID_LOGIN)); }
  if (identity.hash === undefined || identity.salt === undefined) {
    return done(new ApiError(HTTPStatus.BadRequest, VERIFY_ACCOUNT));
  }

  if (!validPassword(password, identity.salt, identity.hash)) {
    return done(new ApiError(HTTPStatus.BadRequest, INVALID_LOGIN));
  }

  const userRepo = getRepository(User);
  return done(null, await userRepo.findOne({ id: identity.id }));
});

export const localLogin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return next(new ApiError(HTTPStatus.BadRequest, INVALID_LOGIN)); }
    return req.logIn(user, (e: any) => {
      if (e) { return next(e); }
      return res.send();
    });
  })(req, res, next);
};
