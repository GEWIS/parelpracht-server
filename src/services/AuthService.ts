import express from 'express';
import { Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { IdentityLocal } from '../entity/IdentityLocal';
import { User } from '../entity/User';
import { Mailer } from '../mailer/Mailer';
import { resetPassword } from '../mailer/templates/resetPassword';
import { ApiError, HTTPStatus } from '../helpers/error';
import { generateSalt, hashPassword } from '../auth';
import { newUser } from '../mailer/templates/newUser';
import { IdentityApiKey } from '../entity/IdentityApiKey';
import { newApiKey } from '../mailer/templates/newApiKey';
import { viewApiKey } from '../mailer/templates/viewApiKey';
import { IdentityLDAP } from '../entity/IdentityLDAP';
import AppDataSource from '../database';

const INVALID_TOKEN = 'Invalid token.';
export interface AuthStatus {
  authenticated: boolean;
}

export interface Profile extends User {
  hasApiKey?: boolean;
}

export interface LdapIdentityParams {
  username: string;
}

export default class AuthService {
  identityLocalRepo: Repository<IdentityLocal>;

  identityApiKeyRepo: Repository<IdentityApiKey>;

  identityLdapRepo: Repository<IdentityLDAP>;

  userRepo: Repository<User>;

  constructor(
    identityLocalRepo?: Repository<IdentityLocal>,
    userRepo?: Repository<User>,
    identityApiKeyRepo?: Repository<IdentityApiKey>,
    identityLdapRepo?: Repository<IdentityLDAP>,
  ) {
    this.identityLocalRepo = identityLocalRepo ?? AppDataSource.getRepository(IdentityLocal);
    this.identityApiKeyRepo = identityApiKeyRepo ?? AppDataSource.getRepository(IdentityApiKey);
    this.identityLdapRepo = identityLdapRepo ?? AppDataSource.getRepository(IdentityLDAP);
    this.userRepo = userRepo ?? AppDataSource.getRepository(User);
  }

  async getAuthStatus(req: express.Request): Promise<AuthStatus> {
    const authenticated = req.isAuthenticated();

    return {
      authenticated,
    };
  }

  async getProfile(req: express.Request): Promise<Profile> {
    const user = (await this.userRepo.findOne(
      { where: { id: (req.user as User).id },
        relations: ['roles'] },
    ))! as Profile;

    const identity = (await this.identityApiKeyRepo.findOneBy(
      { id: user.id },
    ));

    user.hasApiKey = identity?.apiKey !== undefined;

    return user;
  }

  async getAllLdapIdentities(): Promise<IdentityLDAP[]> {
    return this.identityLdapRepo.find({ relations: ['user'] });
  }

  async logout(req: express.Request) : Promise<void> {
    req.logout();
  }

  async forgotPassword(userEmail: string): Promise<void> {
    let email = validator.normalizeEmail(userEmail);
    if (email === false) {
      email = '';
    }
    const user = await this.userRepo.findOneBy({ email });
    const identity = user !== undefined ? await this.identityLocalRepo.findOneBy({ id: user?.id }) : undefined;

    if (user == null || identity == null) {
      return;
    }

    Mailer.getInstance().send(resetPassword(
      user, `${process.env.SERVER_HOST}/reset-password?token=${this.getResetPasswordToken(
        user, identity,
      )}`,
    ));
  }

  async createIdentityLocal(user: User, silent: boolean): Promise<IdentityLocal> {
    let identity = await this.identityLocalRepo.findOneBy({ id: user.id });
    if (identity) throw new ApiError(HTTPStatus.BadRequest, 'Identity already exists.');

    identity = this.identityLocalRepo.create({
      id: user.id,
      // email: user.email,
      verifiedEmail: false,
      salt: generateSalt(),
    });
    await this.identityLocalRepo.insert(identity);
    identity = (await this.identityLocalRepo.findOneBy({ id: user.id }))!;

    if (!silent) {
      Mailer.getInstance().send(newUser(
        user, `${process.env.SERVER_HOST}/reset-password?token=${this.getSetPasswordToken(
          user, identity,
        )}`,
      ));
    }

    return identity!;
  }

  async updateIdentityLdap(user: User, params: Partial<LdapIdentityParams>): Promise<IdentityLDAP> {
    let identity = await this.identityLdapRepo.findOneBy({ id: user.id });
    if (!identity) throw new ApiError(HTTPStatus.NotFound, 'Identity not found.');

    await this.identityLdapRepo.update(identity.id, params);
    identity = await this.identityLdapRepo.findOneBy({ id: identity.id });
    return identity!;
  }

  async removeIdentityLocal(user: User): Promise<void> {
    await this.identityLocalRepo.delete(user.id);
  }

  async createIdentityLdap(user: User, params: LdapIdentityParams): Promise<IdentityLDAP> {
    let identity = await this.identityLdapRepo.findOneBy({ id: user.id });
    if (identity) throw new ApiError(HTTPStatus.BadRequest, 'Identity already exists.');

    identity = this.identityLdapRepo.create({
      id: user.id,
      ...params,
    });
    await this.identityLdapRepo.insert(identity);
    identity = await this.identityLdapRepo.findOneBy({ id: identity.id });
    return identity!;
  }

  async removeIdentityLdap(user: User): Promise<void> {
    await this.identityLdapRepo.delete(user.id);
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

  getSetPasswordToken(user: User, identity: IdentityLocal): string {
    return jwt.sign(
      {
        type: 'PASSWORD_SET',
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

    const user = await this.userRepo.findOneBy({ id: token.user_id });
    const identity = await this.identityLocalRepo.findOneBy({ id: token.user_id });
    // Check if the user is defined
    if (user == null || identity == null) {
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
        await this.identityLocalRepo.update(user.id, {
          id: user.id,
          // email: user.email,
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

  async deleteIdentities(id: number) {
    await this.identityLocalRepo.softDelete(id);
  }

  async getApiKey(req: express.Request) {
    const user = (await this.userRepo.findOneBy(
      { id: (req.user as User).id },
    ))!;

    const identity = await this.identityApiKeyRepo.findOneBy(
      { id: (req.user as User).id },
    );

    if (identity == null) {
      throw new ApiError(HTTPStatus.BadRequest, 'You don\'t have an API key yet.');
    }

    Mailer.getInstance().send(viewApiKey(
      user, `${process.env.SERVER_HOST}/`,
    ));

    return identity.apiKey;
  }

  async generateApiKey(req: express.Request) {
    const user = (await this.userRepo.findOneBy(
      { id: (req.user as User).id },
    ))!;

    let identity = await this.identityApiKeyRepo.findOneBy(
      { id: (req.user as User).id },
    );

    if (identity != null) {
      throw new ApiError(HTTPStatus.BadRequest, 'You already have an API key.');
    }

    identity = this.identityApiKeyRepo.create({
      id: user.id,
      apiKey: generateSalt(),
    });

    await this.identityApiKeyRepo.insert(identity);

    Mailer.getInstance().send(newApiKey(
      user, `${process.env.SERVER_HOST}/`,
    ));

    return identity.apiKey;
  }

  async revokeApiKey(req: express.Request) {
    await this.identityApiKeyRepo.delete((req.user as User).id);
  }
}
