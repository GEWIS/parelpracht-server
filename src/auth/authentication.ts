import express from 'express';
import { IdentityApiKey } from '../entity/IdentityApiKey';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import AppDataSource from '../database';

async function authWithApiKey(apiKey: string) {
  const split = apiKey.split(' ');
  const key = split[split.length - 1];

  if (key === undefined) {
    throw new ApiError(HTTPStatus.Unauthorized, 'Unknown API Key');
  }

  const identity = (await AppDataSource.getRepository(IdentityApiKey)
    .findOneBy({ apiKey: key }))!;

  if (identity === undefined) {
    throw new ApiError(HTTPStatus.Unauthorized, 'Unknown API Key');
  }

  return (await AppDataSource.getRepository(User)
    .findOne({ where: { id: identity.id }, relations: ['roles'] }))!;
}

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[],
): Promise<any> {
  switch (securityName) {
  case 'local': {
    const auth = request.header('Authentication');
    if (auth) {
      return authWithApiKey(auth);
    }

    if (!request.isAuthenticated() || request.user === undefined) {
      throw new ApiError(HTTPStatus.Unauthorized, 'You are not logged in.');
    }

    // If any roles are defined, check them
    if (scopes !== undefined && scopes.length > 0) {
      const user = (await AppDataSource.getRepository(User)
        .findOne({ where: { id: (request.user as User).id }, relations: ['roles'] }))!;

      // Compute if there is an intersection
      const intersect = user.roles.some((r) => {
        return scopes.find((s) => s === r.name) !== undefined;
      });
        // If the intersection of the roles is non-empty, the user is authorized
      if (!intersect) {
        throw new ApiError(HTTPStatus.Unauthorized, 'You don\'t have permission to do this.');
      }
    }
    return request.user;
  }
  default: throw new Error('Unknown security scheme');
  }
}
