const capitalize = <S extends string>(str: S): Capitalize<S> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>;

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// eslint-disable-next-line no-control-regex
const toWritableUtf = (str: string): string => str.replace(/[^\x00-\xFF]/g, '');

export { capitalize, randomFromArray, toWritableUtf };
