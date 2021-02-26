import _ from 'lodash';
import { User } from '../entity/User';

export function getEntityChanges<T extends object>(
  newEntity: Partial<T>, oldEntity: T,
): Partial<T> {
  const result: Partial<T> = {};

  Object.keys(newEntity).forEach((k) => {
    // @ts-ignore
    if (newEntity[k] !== oldEntity[k]) {
      // @ts-ignore
      result[k] = newEntity[k];
    }
  });

  return result;
}

function parsePropertyChanges<T>(
  newProperties: Partial<T>, oldProperties: T,
): string {
  const keys = Object.getOwnPropertyNames(newProperties);
  if (keys.length === 0) return '';

  // Create a typed-out change with the from and to values
  const parsedChanges = keys.map((k) => {
    // @ts-ignore
    return `${_.startCase(k)} from ${oldProperties[k].toString()} to ${newProperties[k].toString()}`;
  });

  // If there is only one change, return this only change
  if (parsedChanges.length === 1) {
    return parsedChanges[0];
  }

  // If there are more than 1 changes, merge them all into a single,
  // beautiful string and return this.
  return parsedChanges.reduce((result, s, i) => {
    if (i === parsedChanges.length) {
      return `${result}and ${s}`;
    }
    return `${result}${s}, `;
  });
}

export function createEditActivityDescription<T>(
  newProperties: Partial<T>, oldProperties: T,
): string {
  return `Changed ${parsePropertyChanges<T>(newProperties, oldProperties)}.`;
}

export function createReassignActivityDescription(
  newUser: User, oldUser: User,
): string {
  return `Changed from ${oldUser.fullName()} to ${newUser.fullName()}`;
}
