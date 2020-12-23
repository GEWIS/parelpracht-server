import { Strategy as LocalStrategy } from 'passport-local';
import { getRepository } from 'typeorm';
import crypto from 'crypto';
import passport from 'passport';
import express from 'express';
import { IdentityLocal } from '../entity/IdentityLocal';
import { User } from '../entity/User';

const INVALID_LOGIN = 'Invalid login credentials';

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
  if (identity === undefined) { return done(new Error(INVALID_LOGIN)); }

  if (!validPassword(password, identity.salt, identity.hash)) {
    return done(new Error(INVALID_LOGIN));
  }

  const userRepo = getRepository(User);
  return done(null, await userRepo.findOne({ id: identity.userId }));
});

export const localLogin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return next(new Error(INVALID_LOGIN)); }
    return req.logIn(user, (e: any) => {
      if (e) { return next(e); }
      return res.send();
    });
  })(req, res, next);
};
