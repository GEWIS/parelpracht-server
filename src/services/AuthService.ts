import express from 'express';
import { getRepository, Repository } from 'typeorm';
import { IdentityLocal } from '../entity/IdentityLocal';
import { User } from '../entity/User';

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
}
