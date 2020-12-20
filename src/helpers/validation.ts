import express from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { ApiError, HTTPStatus } from './error';

// parallel processing
export const validate = async (
  validations: ValidationChain[],
  req: express.Request,
) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(HTTPStatus.BadRequest, 'Your request isn\'t quite right.\n Please try again');
  }
};

// sequential processing, stops running validations chain if the previous one have failed.
export const validateSeq = async (
  validations: ValidationChain[],
  req: express.Request,
) => {
  for (let i = 0; i < validations.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const result = await validations[i].run(req);
    if (!result.isEmpty()) break;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(HTTPStatus.BadRequest, 'Your request isn\'t quite right.\n Please try again');
  }
};
