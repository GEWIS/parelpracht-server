import { Brackets, FindOptionsWhere, ILike, In, SelectQueryBuilder } from 'typeorm';
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

export function addQueryBuilderFilters(queryBuilder: SelectQueryBuilder<any>, filters: ListOrFilter[]) {
  filters.forEach(({ column, values }: ListOrFilter, index: number) => {
    // only allows for one level deep relations
    if (column.includes('.')) {
      const alias = column.split('.')[0];

      // only join if alias is not yet joined
      const aliasExists = queryBuilder.expressionMap.aliases.some((a) => a.name === alias);
      if (!aliasExists) {
        if (alias === 'activities') {
          // subquery to join only the latest related activity
          queryBuilder.innerJoin(
            `${queryBuilder.alias}.${alias}`,
            alias,
            `${alias}.createdAt = (
              SELECT MAX(subQuery.updatedAt)
              FROM ${queryBuilder.alias}_activity subQuery
              WHERE subQuery.${queryBuilder.alias}Id = ${queryBuilder.alias}.id AND subQuery.subType IS NOT NULL
            )`);
        } else {
          queryBuilder.innerJoin(`${queryBuilder.alias}.${alias}`, alias);
        }
      }
    }
    const paramName = `param_${index}`;
    // avoid ambiguity in the where clause
    if (!column.includes('.')) {
      column = `${queryBuilder.alias}.${column}`;
    }
    queryBuilder.andWhere(`${column} IN (:...${paramName})`, { [paramName]: values });
  });
}

export function addQueryBuilderSearch(queryBuilder: SelectQueryBuilder<any>, searchString: string, searchFields: string[]) {
  searchFields.forEach((field) => {
    // only allows for one level deep relations
    if (field.includes('.')) {
      const alias = field.split('.')[0];

      // only join if alias is not yet joined
      const aliasExists = queryBuilder.expressionMap.aliases.some((a) => a.name === alias);
      if (!aliasExists) {
        queryBuilder.innerJoin(`${queryBuilder.alias}.${alias}`, alias);
      }
    }
  });
  queryBuilder.andWhere(
    new Brackets((qb) => {
      searchFields.forEach(field => {
        // avoid ambiguity in the where clause
        if (!field.includes('.')) {
          field = `${queryBuilder.alias}.${field}`;
        }
        qb.orWhere(`LOWER(${field}) LIKE LOWER(:value)`, { value: `%${searchString}%` });
      });
    }),
  );
}
