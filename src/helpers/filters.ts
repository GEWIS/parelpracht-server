import { FindConditions } from 'typeorm';

export const cartesian = <T>(
  ...arr: FindConditions<T>[][]
): FindConditions<T>[] => arr.reduce(
    (a, b) => a.flatMap(
      (d) => b.map(
        (e) => ({ ...d, ...e }),
      ),
    ),
  );
