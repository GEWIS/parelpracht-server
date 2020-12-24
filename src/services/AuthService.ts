import express from 'express';
import { getRepository, Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { IdentityLocal } from '../entity/IdentityLocal';
import { User } from '../entity/User';
import { Mailer } from '../mailer/Mailer';
import { resetPassword } from '../mailer/templates/resetPassword';
import { ApiError, HTTPStatus } from '../helpers/error';
import { generateSalt, hashPassword } from '../auth/LocalStrategy';

const INVALID_TOKEN = 'Invalid token.';
export interface AuthStatus {
  authenticated: boolean;
}

export default class AuthService {
  identityRepo: Repository<IdentityLocal>;

  userRepo: Repository<User>;

  constructor() {
    this.identityRepo = getRepository(IdentityLocal);
    this.userRepo = getRepository(User);
  }

  async getAuthStatus(req: express.Request): Promise<AuthStatus> {
    const authenticated = req.isAuthenticated();

    return {
      authenticated,
    };
  }

  async getProfile(req: express.Request): Promise<User> {
    return req.user as User;
  }

  async logout(req: express.Request) : Promise<void> {
    req.logout();
  }

  async forgotPassword(userEmail: string): Promise<void> {
    const email = userEmail.toLowerCase();
    const user = await this.userRepo.findOne({ email });
    const identity = await this.identityRepo.findOne({ email });

    if (user === undefined || identity === undefined) {
      return;
    }

    Mailer.getInstance().send(resetPassword(
      user, `${process.env.SERVER_HOST}/reset-password?token=${this.getResetPasswordToken(
        user, identity,
      )}`,
    ));
  }

  getResetPasswordToken(user: User, identity: IdentityLocal): string {
    return jwt.sign(
      {
        type: 'PASSWORD_RESET',
        user_id: user.id,
      },
      // Password salt + user createdAt as unique key
      `${identity.salt || ''}.${user.createdAt}`,
      { expiresIn: '7 days' },
    );
  }

  async resetPassword(newPassword: string, tokenString: string): Promise<void> {
    const token = jwt.decode(tokenString);
    if (!(token && typeof token !== 'string')) {
      throw new ApiError(HTTPStatus.BadRequest, INVALID_TOKEN);
    }

    const user = await this.userRepo.findOne({ id: token.user_id });
    const identity = await this.identityRepo.findOne({ id: token.user_id });
    // Check if the user is defined
    if (user === undefined || identity === undefined) {
      throw new ApiError(HTTPStatus.BadRequest, INVALID_TOKEN);
    }

    try {
      switch (token.type) {
        case 'PASSWORD_RESET':
        case 'PASSWORD_SET':
        {
          // Verify the token
          jwt.verify(tokenString, `${identity.salt || ''}.${user.createdAt}`);
          const salt = generateSalt();
          await this.identityRepo.update(user.id, {
            id: user.id,
            email: user.email,
            verifiedEmail: true,
            hash: hashPassword(newPassword, salt),
            salt,
          });
          return;
        }
        default:
          throw new ApiError(HTTPStatus.BadRequest, INVALID_TOKEN);
      }
    } catch (e) {
      throw new ApiError(HTTPStatus.BadRequest, INVALID_TOKEN);
    }
  }
}
