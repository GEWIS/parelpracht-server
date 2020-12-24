import express from 'express';
import { ApiError, HTTPStatus } from '../helpers/error';

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[],
): Promise<any> {
  switch (securityName) {
    case 'local': {
      if (request.isAuthenticated()) {
        return request.user;
      }

      throw new ApiError(HTTPStatus.Unauthorized, 'You are not logged in.');
    }
    default: throw new Error('Unknown security scheme');
  }
}
