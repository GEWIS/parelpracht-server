import { Repository } from 'typeorm';
import { sign as jwtSign, decode as jwtDecode, verify as jwtVerify, JwtPayload } from 'jsonwebtoken';
import { normalizeEmail } from 'validator';
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
import { ExpressRequest } from '../types';

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

interface JwtToken {
  user_id: number;
  type: string;
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

  getAuthStatus(req: ExpressRequest): AuthStatus {
    const authenticated = req.isAuthenticated();

    return {
      authenticated,
    };
  }

  async getProfile(req: ExpressRequest): Promise<Profile> {
    const user = (await this.userRepo.findOne({
      where: { id: (req.user as User).id },
      relations: ['roles'],
    }))! as Profile;

    const identity = await this.identityApiKeyRepo.findOneBy({ id: user.id });

    user.hasApiKey = identity?.apiKey !== undefined;

    return user;
  }

  async getAllLdapIdentities(): Promise<IdentityLDAP[]> {
    return this.identityLdapRepo.find({ relations: ['user'] });
  }

  // TODO check error type in case of reject
  async logout(req: ExpressRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      req.logout((error: Error | undefined) => {
        if (error) reject(error);
        resolve();
      });
    });
  }

  // TODO check error type in case of reject
  login(user: User, req: ExpressRequest) {
    return new Promise<void>((resolve, reject) => {
      req.logIn(user, (error: Error | undefined) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }

  async forgotPassword(userEmail: string): Promise<void> {
    let email = normalizeEmail(userEmail);
    if (email === false) {
      email = '';
    }
    const user = await this.userRepo.findOneBy({ email });
    const identity = user !== undefined ? await this.identityLocalRepo.findOneBy({ id: user?.id }) : undefined;

    if (user == null || identity == null) {
      return;
    }

    // void -- error is explicitly logged, we do not want to await
    // https://github.com/GEWIS/parelpracht-server/pull/41#discussion_r1981384390
    void Mailer.getInstance().send(
      resetPassword(
        user,
        `${process.env.SERVER_HOST}/reset-password?token=${this.getResetPasswordToken(user, identity)}`,
      ),
    );
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
      // void -- error is explicitly logged, we do not want to await
      // https://github.com/GEWIS/parelpracht-server/pull/41#discussion_r1981384390
      void Mailer.getInstance().send(
        newUser(user, `${process.env.SERVER_HOST}/reset-password?token=${this.getSetPasswordToken(user, identity)}`),
      );
    }

    return identity;
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
    return jwtSign(
      {
        type: 'PASSWORD_RESET',
        user_id: user.id,
      },
      // Password salt + user createdAt as unique key
      `${identity.salt || ''}.${user.createdAt.toString()}`,
      { expiresIn: '7 days' },
    );
  }

  getSetPasswordToken(user: User, identity: IdentityLocal): string {
    return jwtSign(
      {
        type: 'PASSWORD_SET',
        user_id: user.id,
      },
      // Password salt + user createdAt as unique key
      `${identity.salt || ''}.${user.createdAt.toString()}`,
      { expiresIn: '7 days' },
    );
  }

  checkToken(token: string | JwtPayload | null): token is JwtToken {
    return token != null && typeof token === 'object' && 'used_id' in token;
  }

  async resetPassword(newPassword: string, tokenString: string): Promise<void> {
    const token = jwtDecode(tokenString);
    if (!this.checkToken(token)) {
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
        case 'PASSWORD_SET': {
          // Verify the token
          jwtVerify(tokenString, `${identity.salt || ''}.${user.createdAt.toString()}`);
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
      }
    } catch {
      throw new ApiError(HTTPStatus.BadRequest, INVALID_TOKEN);
    }
  }

  async deleteIdentities(id: number) {
    await this.identityLocalRepo.softDelete(id);
  }

  async getApiKey(req: ExpressRequest) {
    const user = (await this.userRepo.findOneBy({ id: (req.user as User).id }))!;

    const identity = await this.identityApiKeyRepo.findOneBy({ id: (req.user as User).id });

    if (identity == null) {
      throw new ApiError(HTTPStatus.BadRequest, "You don't have an API key yet.");
    }

    // void -- error is explicitly logged, we do not want to await
    // https://github.com/GEWIS/parelpracht-server/pull/41#discussion_r1981384390
    void Mailer.getInstance().send(viewApiKey(user, `${process.env.SERVER_HOST}/`));

    return identity.apiKey;
  }

  async generateApiKey(req: ExpressRequest) {
    const user = (await this.userRepo.findOneBy({ id: (req.user as User).id }))!;

    let identity = await this.identityApiKeyRepo.findOneBy({ id: (req.user as User).id });

    if (identity != null) {
      throw new ApiError(HTTPStatus.BadRequest, 'You already have an API key.');
    }

    identity = this.identityApiKeyRepo.create({
      id: user.id,
      apiKey: generateSalt(),
    });

    await this.identityApiKeyRepo.insert(identity);

    // void -- error is explicitly logged, we do not want to await
    // https://github.com/GEWIS/parelpracht-server/pull/41#discussion_r1981384390
    void Mailer.getInstance().send(newApiKey(user, `${process.env.SERVER_HOST}/`));

    return identity.apiKey;
  }

  async revokeApiKey(req: ExpressRequest) {
    await this.identityApiKeyRepo.delete((req.user as User).id);
  }
}
