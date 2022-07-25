const capitalize = <S extends string>(str: S): Capitalize<S> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>;

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export { capitalize, randomFromArray };
