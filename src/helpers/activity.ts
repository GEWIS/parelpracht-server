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

function printStringArrayToString(items: string[]): string {
  if (items.length === 0) {
    return '';
  }
  if (items.length === 1) {
    return items[0];
  }

  return items.reduce((result, s, i) => {
    if (i === items.length - 1) {
      return `${result.substring(0, result.length - 2)} and ${s}`;
    }
    return `${result}${s}, `;
  }, '');
}

function splitStringToStringArray(list: string): string[] {
  // Split the string on comma's
  const split = list.split(',');
  // Split the final string in the items on the word "and"
  const lastTwo = split[split.length - 1].split('and');
  // Remove the last item, because we have split it separately
  split.splice(split.length - 1, 1);
  // Merge everything and trim every string
  return split.concat(lastTwo).map((s) => s.trim());
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

  return printStringArrayToString(parsedChanges);
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

export function createAddProductActivityDescription(products: string[]): string {
  return `Added ${printStringArrayToString(products)}.`;
}

export function appendProductActivityDescription(
  products: string[], currentDescription: string,
): string {
  const printedProductList = currentDescription.substring(6, currentDescription.length - 1);
  const currentProducts = splitStringToStringArray(printedProductList);
  return createAddProductActivityDescription(currentProducts.concat(products));
}

export function createDelProductActivityDescription(products: string[]): string {
  return `Removed ${printStringArrayToString(products)}.`;
}
