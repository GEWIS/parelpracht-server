import { body, ValidationChain, validationResult } from 'express-validator';
import ContactService from '../services/ContactService';
import { ExpressRequest } from '../types';
import { ApiError, HTTPStatus } from './error';

/**
 * Run a list of validations (in parallel) on a request object
 * @param validations Array of validations to execute on the request
 * @param req Express.js request object
 */
export const validate = async (validations: ValidationChain[], req: ExpressRequest) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(HTTPStatus.BadRequest, JSON.stringify(errors.array()));
  }
};

/**
 * Run a list of validations (in sequence) on a request object.
 * Stops running validations chain if the previous one have failed.
 * @param validations Array of validations to execute on the request
 * @param req Express.js request object
 */
export const validateSeq = async (validations: ValidationChain[], req: ExpressRequest) => {
  for (let i = 0; i < validations.length; i++) {
    const result = await validations[i].run(req);
    if (!result.isEmpty()) break;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(HTTPStatus.BadRequest, JSON.stringify(errors.array()));
  }
};

/**
 * Validate whether the given contact is in the given company
 * @param contactId ID of the contact to check
 * @param req Express.js request object, with the company id in the body
 */
export const contactInCompany = (contactId: number, req: ExpressRequest) => {
  new ContactService()
    .getContact(contactId)
    .then((contact) => {
      // TODO how to type body of request?

      if (contact.companyId !== req.body.companyId) {
        return Promise.reject(new Error('Contact does not belong to company'));
      }
      return Promise.resolve();
    })
    .catch((err: Error) => {
      return Promise.reject(new ApiError(HTTPStatus.BadRequest, err.message));
    });
};

/**
 * Validate the parameters of an activity
 * @param req Express.js request object
 * @param validations Optional additional validations to execute
 */
export const validateActivityParams = async (req: ExpressRequest, validations: ValidationChain[] = []) => {
  await validate([body('description').isString().trim()].concat(validations), req);
};

/**
 * Validate the parameters of a comment activity
 * @param req Express.js request object
 * @param validations Optional additional validations to execute
 */
export const validateCommentParams = async (req: ExpressRequest, validations: ValidationChain[] = []) => {
  await validate([body('description').isString().notEmpty().trim()].concat(validations), req);
};

/**
 * Validate the parameters of a file object
 * @param req Express.js request object
 * @param validations Optional additional validations to execute
 */
export const validateFileParams = async (req: ExpressRequest, validations: ValidationChain[] = []) => {
  await validate([body('name').trim()].concat(validations), req);
};
