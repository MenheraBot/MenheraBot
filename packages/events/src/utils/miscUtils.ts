import i18next from 'i18next';
import { AvailableLanguages, Translation, availableLanguages } from '../types/i18next.js';
import { DatabaseUserThemesSchema } from '../types/database.js';
import { ProbabilityAmount, ProbabilityType } from '../types/menhera.js';

const capitalize = <S extends string>(str: S): Capitalize<S> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>;

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// eslint-disable-next-line no-control-regex
const toWritableUtf = (str: string): string => str.replace(/[^\x00-\xFF]/g, '');

const millisToSeconds = (milli: number): number => Math.floor(milli / 1000);

const millisToHours = (milli: number): number => Math.floor(milli / 1000 / 60 / 60);

const minutesToMillis = (minutes: number): number => 1000 * 60 * minutes;

const hoursToMillis = (hours: number): number => minutesToMillis(60 * hours);

const daysToMillis = (days: number): number => 1000 * 60 * 60 * 24 * days;

const getElapsedTime = (since: number, unit: 'seconds' | 'minutes'): number => {
  const time = Date.now() - since;

  return unit === 'minutes' ? Math.floor(time / (60 * 1000)) : Math.floor(time / 1000);
};

const negate = (value: number): number => value * -1;

const noop = (..._args: unknown[]) => null;

const localizedResources = (
  key: Translation,
  options?: Record<string, unknown>,
): Record<AvailableLanguages, string> => {
  return availableLanguages.reduce(
    (p, c) => {
      const fixedT = i18next.getFixedT(c);
      const result = fixedT(key, options);

      p[c] = result;

      return p;
    },
    {} as Record<string, string>,
  );
};

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

const numberizeAllValues = <T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]: number } =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = Number(value);
    return acc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as any) as { [K in keyof T]: number };

const defaultUserThemes = {
  cardsThemes: 4,
  tableThemes: 5,
  profileThemes: 3,
  cardsBackgroundThemes: 6,
  ebBackgroundThemes: 25,
  ebTextBoxThemes: 26,
  ebMenheraThemes: 27,
  profileImages: 1,
};

const ensureUserHaveDefaultThemes = (userThemes: DatabaseUserThemesSchema): void => {
  Object.entries(defaultUserThemes).forEach((entries) => {
    const [key, value] = entries as [keyof typeof defaultUserThemes, number];

    if (userThemes[key].some((a) => a.id === value)) return;

    userThemes[key].push({ id: value, aquiredAt: Date.now() });
  });
};

const calculateProbability = <Prob extends ProbabilityAmount | ProbabilityType>(
  probabilities: Prob[],
): Prob['value'] => {
  let accumulator = probabilities.reduce((p, c) => p + c.probability, 0);
  const chance = Math.floor(Math.random() * accumulator);

  for (const data of probabilities) {
    accumulator -= data.probability;
    if (chance >= accumulator) {
      return data.value;
    }
  }

  return 0;
};

export {
  capitalize,
  daysToMillis,
  randomFromArray,
  toWritableUtf,
  numberizeAllValues,
  getCustomThemeField,
  millisToSeconds,
  localizedResources,
  calculateProbability,
  hoursToMillis,
  ensureUserHaveDefaultThemes,
  chunkArray,
  minutesToMillis,
  getElapsedTime,
  millisToHours,
  negate,
  noop,
  getMillisecondsToTheEndOfDay,
};
