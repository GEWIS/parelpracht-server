/**
 * Compares two entity objects and returns an object only containing the (new) differences
 * @param newEntity The new entity object
 * @param oldEntity The old entity object
 */
export default function getEntityChanges<T extends object>(newEntity: Partial<T>, oldEntity: T): Partial<T> {
  const result: Partial<T> = {};

  Object.keys(newEntity).forEach((key) => {
    const k = key as keyof T;
    if (
      !(
        newEntity[k] instanceof Date &&
        oldEntity[k] instanceof Date &&
        newEntity[k].getTime() === oldEntity[k].getTime()
      )
    ) {
      if (newEntity[k] !== oldEntity[k]) {
        result[k] = newEntity[k];
      }
    }
  });

  return result;
}
