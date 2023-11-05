const capitalize = <S extends string>(str: S): Capitalize<S> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>;

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// eslint-disable-next-line no-control-regex
const toWritableUtf = (str: string): string => str.replace(/[^\x00-\xFF]/g, '');

const millisToSeconds = (milli: number): number => Math.floor(milli / 1000);

const millisToHours = (milli: number): number => Math.floor(milli / 1000 / 60 / 60);

const minutesToMillis = (minutes: number): number => 1000 * 60 * minutes;

const daysToMillis = (days: number): number => 1000 * 60 * 60 * 24 * days;

const negate = (value: number): number => value * -1;

const chunkArray = <T>(arr: T[], chunkSize: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) chunks.push(arr.slice(i, i + chunkSize));

  return chunks;
};

const getMillisecondsToTheEndOfDay = (): number => {
  const date = new Date();
  const passedMilli =
    date.getHours() * 3600000 +
    date.getMinutes() * 60000 +
    date.getSeconds() * 1000 +
    date.getMilliseconds();

  return 86400000 - passedMilli;
};

const getCustomThemeField = (field: string, customFields: string[]): boolean => {
  const index = customFields.indexOf(field);
  return customFields[index + 1] === 'true';
};

export {
  capitalize,
  daysToMillis,
  randomFromArray,
  toWritableUtf,
  getCustomThemeField,
  millisToSeconds,
  chunkArray,
  minutesToMillis,
  millisToHours,
  negate,
  getMillisecondsToTheEndOfDay,
};
