import _ from 'lodash';
import { getRepository, Repository } from 'typeorm';
import { User } from '../entity/User';
import { BaseEnt } from '../entity/BaseEnt';
import ActivityService from '../services/ActivityService';
import UserService from '../services/UserService';
import { ActivityType } from '../entity/enums/ActivityType';
import { Product } from '../entity/Product';
import { Company } from '../entity/Company';
import { Contact } from '../entity/Contact';
import { ProductCategory } from '../entity/ProductCategory';
import Currency from './currency';
import { timeToYearDayTime } from './timestamp';
import getEntityChanges from './entityChanges';
import { Language } from '../entity/enums/Language';

/**
 * Convert an array of strings to a single string, where all items are split by
 * commas and a final ", and"
 * @param items An array of strings to convert to a single string
 * @param preSuffix An optional prefix / suffix to put before and after every
 * string in the items array
 */
function printStringArrayToString(items: string[], preSuffix = ''): string {
  if (items.length === 0) {
    return '';
  }
  if (items.length === 1) {
    return items[0];
  }

  return items.reduce((result, s, i) => {
    if (i === items.length - 1) {
      return `${result.substring(0, result.length - 2)} and ${preSuffix}${s}${preSuffix}`;
    }
    return `${result}${preSuffix}${s}${preSuffix}, `;
  }, '');
}

/**
 * Split a single summation string into an array of strings. The split is
 * executed on commas and the word "and".
 * @param list A list of different things, to convert to an array.
 */
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

/**
 * Parse all property changes into a single string, where all properties
 * with their old and new values are included
 * @param newProperties Partial with only the newly changed properties
 * @param oldProperties The old entity
 */
async function parsePropertyChanges<T>(
  newProperties: Partial<T>, oldProperties: T,
): Promise<string> {
  const keys = Object.getOwnPropertyNames(newProperties);
  if (keys.length === 0) return '';

  // Before we continue, we need to process some relational attributes
  const processedNew: any = {};
  const processedOld: any = {};
  let newEnt;
  let oldEnt;
  await Promise.all(keys.map(async (k) => {
    // Parse all possible relational attributes ID's to their respective names
    switch (k) {
      case 'productId':
        // @ts-ignore
        newEnt = await getRepository(Product).findOne(newProperties.productId);
        // @ts-ignore
        oldEnt = await getRepository(Product).findOne(oldProperties.productId);
        processedNew.product = newEnt !== undefined ? newEnt.nameEnglish : '...';
        processedOld.product = oldEnt !== undefined ? oldEnt.nameEnglish : '...';
        break;
      case 'companyId':
        // @ts-ignore
        newEnt = await getRepository(Company).findOne(newProperties.companyId);
        // @ts-ignore
        oldEnt = await getRepository(Company).findOne(oldProperties.companyId);
        processedNew.company = newEnt !== undefined ? newEnt.name : '...';
        processedOld.company = oldEnt !== undefined ? oldEnt.name : '...';
        break;
      case 'contactId':
        // @ts-ignore
        newEnt = await getRepository(Contact).findOne(newProperties.contactId);
        // @ts-ignore
        oldEnt = await getRepository(Contact).findOne(oldProperties.contactId);
        processedNew.contact = newEnt !== undefined ? newEnt.fullName() : '...';
        processedOld.contact = oldEnt !== undefined ? oldEnt.fullName() : '...';
        break;
      case 'assignedToId':
        // @ts-ignore
        newEnt = await getRepository(User).findOne(newProperties.assignedToId);
        // @ts-ignore
        oldEnt = await getRepository(User).findOne(oldProperties.assignedToId);
        processedNew.assignment = newEnt !== undefined ? newEnt.fullName() : '...';
        processedOld.assignment = oldEnt !== undefined ? oldEnt.fullName() : '...';
        break;
      case 'categoryId':
        // @ts-ignore
        newEnt = await getRepository(ProductCategory).findOne(newProperties.categoryId);
        // @ts-ignore
        oldEnt = await getRepository(ProductCategory).findOne(oldProperties.categoryId);
        processedNew.category = newEnt !== undefined ? newEnt.name : '...';
        processedOld.category = oldEnt !== undefined ? oldEnt.name : '...';
        break;
      // If it is not a relational attribute, simply copy the value with the same key
      default:
        // @ts-ignore
        processedNew[k] = newProperties[k];
        // @ts-ignore
        processedOld[k] = oldProperties[k];
    }
  }));

  // Create a typed-out change with the from and to values
  const parsedChanges = Object.getOwnPropertyNames(processedNew).map((k: string) => {
    let parsedField = _.startCase(k).toLowerCase();
    // Parse different languages nicely
    parsedField = parsedField.replace('english', '(English)');
    parsedField = parsedField.replace('dutch', '(Dutch)');

    let parsedOld = processedOld[k].toString();
    let parsedNew = processedNew[k].toString();
    // Parse prices from ugly integers in cents to beautifully formatted prices
    if (k === 'basePrice' || k === 'discount' || k === 'targetPrice') {
      parsedOld = `€ ${Currency.priceAttributeToEuro(parseInt(parsedOld, 10), Language.ENGLISH)}`;
      parsedNew = `€ ${Currency.priceAttributeToEuro(parseInt(parsedNew, 10), Language.ENGLISH)}`;
    }
    // Parse dates of invoices to DD-MM-YYYY
    if (k === 'startDate') {
      parsedField = 'invoice date';
      parsedOld = `${timeToYearDayTime(processedOld[k])}`;
      parsedNew = `${timeToYearDayTime(processedNew[k])}`;
    }

    return `${parsedField} from "${parsedOld}" to "${parsedNew}"`;
  });

  return printStringArrayToString(parsedChanges);
}

/**
 * Create the description of an edit-entity-activity
 * @param newProperties Partial with only the newly changed properties
 * @param oldProperties The old entity
 */
async function createEditActivityDescription<T>(
  newProperties: Partial<T>, oldProperties: T,
): Promise<string> {
  return `Changed ${await parsePropertyChanges<T>(newProperties, oldProperties)}.`;
}

/**
 * Create the description of an reassign-activity
 * @param newUser User who received the assignment
 * @param oldUser User who "lost" the assignment
 */
function createReassignActivityDescription(
  newUser: User, oldUser: User,
): string {
  return `Changed from ${oldUser.fullName()} to ${newUser.fullName()}`;
}

/**
 * Create the description of an add-product-activity (for contracts)
 * @param products Array of product names
 */
export function createAddProductActivityDescription(products: string[]): string {
  return `Added ${printStringArrayToString(products, '"')}.`;
}

/**
 * Add an extra product to an existing description of adding products
 * @param products Array of products to be added to the "old" description
 * @param currentDescription The current description of the add-product-activity
 */
export function appendProductActivityDescription(
  products: string[], currentDescription: string,
): string {
  const printedProductList = currentDescription.substring(6, currentDescription.length - 1);
  const currentProducts = splitStringToStringArray(printedProductList);
  return createAddProductActivityDescription(currentProducts.concat(products));
}

/**
 * Create the description of a product-removed-activity
 * @param products Array of product names, which have been removed
 */
export function createDelProductActivityDescription(products: string[]): string {
  return `Removed ${printStringArrayToString(products, '"')}.`;
}

/**
 * Updates the entity and adds activities for these edits if necessary
 * @param repo TypeORM repository object
 * @param entity Entity that has been pulled from the database and will be changed
 * @param params The changes that should be applied
 * @param activityService Instance of the ActivityService, in which the activities will be created
 * @returns Whether the entity has and should have been updated
 */

export async function createActivitiesForEntityEdits<T extends BaseEnt>(
  repo: Repository<T>, entity: T, params: Partial<T>, activityService: ActivityService,
): Promise<boolean> {
  const changes = getEntityChanges<T>(params, entity);

  // If nothing has changed, we can simply return the contract
  if (Object.keys(changes).length === 0) {
    return false;
  }

  // @ts-ignore
  await repo.update(entity.id, params);

  // If the assigned user has changed, we create an activity for this.
  if (Object.keys(changes).includes('assignedToId')) {
    await activityService.createActivity({
      description: createReassignActivityDescription(
        // @ts-ignore As checked in the if-statement above, the "changes" variable does have
        // an assignedToId value
        await new UserService().getUser(changes.assignedToId!),
        // @ts-ignore Therefore, the real entity must also have this property by definition
        await new UserService().getUser(entity.assignedToId),
      ),
      entityId: entity.id,
      type: ActivityType.REASSIGN,
    });
    // @ts-ignore Remove this change, because we have created an activity for it.
    delete changes.assignedToId;
  }

  // If any other properties have changed, we create an "EDIT" activity for this.
  if (Object.keys(changes).length > 0) {
    await activityService.createActivity({
      description: await createEditActivityDescription(changes, entity),
      entityId: entity.id,
      type: ActivityType.EDIT,
    });
  }

  return true;
}
