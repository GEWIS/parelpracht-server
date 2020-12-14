export enum HTTPStatus {
  OK = 'OK',
  Created = 'Created',
  Accepted = 'Accepted',
  NoContent = 'No Content',

  BadRequest = 'Bad Request',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  NotFound = 'Not Found',

  InternalServerError = 'Internal Server Error',
}

const StatusToCode = {
  OK: 200,
  Created: 201,
  Accepted: 202,
  'No Content': 204,

  'Bad Request': 400,
  Unauthorized: 401,
  Forbidden: 403,
  'Not Found': 404,

  'Internal Server Error': 500,
};

export class ApiError extends Error {
  /** The status code of the error, as defined by HTTP status codes. */
  public statusCode: number;

  constructor(status: HTTPStatus, message?: string) {
    super(message);
    this.name = status;
    this.statusCode = StatusToCode[status];
  }
}
