import { FindOptionsWhere, ILike, In } from 'typeorm';
import { BaseEnt } from '../entity/BaseEnt';
import { ListOrFilter, ListParams } from '../controllers/ListParams';

export const cartesian = <T>(
  ...arr: FindOptionsWhere<T>[][]
): FindOptionsWhere<T>[] => arr.reduce(
  (a, b) => a.flatMap(
    (d) => b.map(
      (e) => ({ ...d, ...e }),
    ),
  ),
);

export const cartesianArrays = <T>(
  arr: FindOptionsWhere<T>[][],
): FindOptionsWhere<T>[] => {
  let temp: FindOptionsWhere<T>[] = arr[0];
  for (let i = 1; i < arr.length; i++) {
    temp = cartesian(temp, arr[i]);
  }
  return temp;
};

export function addQueryFilters<T extends BaseEnt>(filters?: ListOrFilter[]) {
  if (filters !== undefined && filters && filters.length > 0) {
    const result: FindOptionsWhere<T> = {};
    filters.forEach((f) => {
      // @ts-ignore
      result[f.column] = f.values.length !== 1 ? In(f.values) : f.values[0];
    });
    return result;
  }
  return undefined;
}

export function addQuerySearch<T extends BaseEnt>(fieldNames: string[], search?: string) {
  if (search !== undefined && search.trim() !== '') {
    const rawSearches: FindOptionsWhere<T>[][] = [];
    search.trim().split(' ').forEach((searchTerm) => {
      rawSearches.push(fieldNames.map((fieldName) => {
        // We can also search on relational fields, so we split the fieldName in different parts
        const intermediates = fieldName.split('.');
        let temp: any = {};
        // The last intermediate is the actual field
        temp[intermediates[intermediates.length - 1]] = ILike(`%${searchTerm}%`);
        // All other intermediates are entities, so we create a nested object over them
        for (let i = intermediates.length - 2; i >= 0; i--) {
          let temp2: any = {};
          temp2[intermediates[i]] = temp;
          temp = temp2;
        }
        console.log(temp);
        return temp;
      }));
    });
    return cartesianArrays(rawSearches);
  }
  return undefined;
}

export function addQueryWhereClause<T extends BaseEnt>(params: ListParams, searchFieldNames: string[]): FindOptionsWhere<T>[] | undefined {
  let conditions: FindOptionsWhere<T>[] = [];

  const filters = addQueryFilters<T>(params.filters);
  if (filters) conditions.push(filters);

  const searches = addQuerySearch<T>(searchFieldNames, params.search);
  if (searches) {
    if (conditions.length > 0) {
      conditions = cartesian(conditions, searches);
    } else {
      conditions = searches;
    }
  }

  return conditions.length > 0 ? conditions : undefined;
}
