import express from 'express';
import { body, ValidationChain, validationResult } from 'express-validator';
import { ApiError, HTTPStatus } from './error';
import ContactService from '../services/ContactService';

// parallel processing
export const validate = async (
  validations: ValidationChain[],
  req: express.Request,
) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(HTTPStatus.BadRequest, JSON.stringify(errors.array()));
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
    throw new ApiError(HTTPStatus.BadRequest, JSON.stringify(errors.array()));
  }
};

export const contactInCompany = async (contactId: number, req: express.Request) => {
  new ContactService().getContact(contactId).then((contact) => {
    if (contact.companyId !== req.body.companyId) {
      return Promise.reject(new Error('Contact does not belong to company'));
    }
    return Promise.resolve();
  });
};

export const validateActivityParams = async (
  req: express.Request, validations: ValidationChain[] = [],
) => {
  await validate([
    body('description').isString().trim(),
  ].concat(validations), req);
};

export const validateCommentParams = async (
  req: express.Request, validations: ValidationChain[] = [],
) => {
  await validate([
    body('description').isString().notEmpty().trim(),
  ].concat(validations), req);
};

export const validateFileParams = async (
  req: express.Request, validations: ValidationChain[] = [],
) => {
  await validate([
    body('name').trim(),
  ].concat(validations), req);
};
