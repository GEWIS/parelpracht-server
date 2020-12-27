import express from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[],
): Promise<any> {
  switch (securityName) {
    case 'local': {
      if (!request.isAuthenticated() || request.user === undefined) {
        throw new ApiError(HTTPStatus.Unauthorized, 'You are not logged in.');
      }

      // If any roles are defined, check them
      if (scopes !== undefined && scopes.length > 0) {
        const user = (await getRepository(User)
          .findOne((request.user as User).id, { relations: ['roles'] }))!;

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
