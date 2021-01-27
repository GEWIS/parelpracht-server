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

export const cartesianArrays = <T>(
  arr: FindConditions<T>[][],
): FindConditions<T>[] => {
  let temp: FindConditions<T>[] = arr[0];
  for (let i = 1; i < arr.length; i++) {
    temp = cartesian(temp, arr[i]);
  }
  return temp;
};
