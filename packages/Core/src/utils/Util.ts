/* eslint-disable no-restricted-syntax */
import MagicItems from '@data/HuntMagicItems';
import {
  CollectorFilter,
  MessageComponentInteraction,
  MessageButton,
  MessageSelectMenu,
  MessageActionRow,
  MessageActionRowComponentResolvable,
  TextBasedChannel,
} from 'discord.js-light';
import {
  AvailableThemeTypes,
  IReturnData,
  IUserThemesSchema,
  ThemeFiles,
  TMagicItemsFile,
} from '@custom_types/Menhera';
import * as Sentry from '@sentry/node';
import ImageThemes from '@data/ImageThemes';
import i18next from 'i18next';

export default class Util {
  static async collectComponentInteractionWithCustomFilter<T extends MessageComponentInteraction>(
    channel: TextBasedChannel,
    filter: CollectorFilter<[T]>,
    time?: number,
  ): Promise<null | T>;

  static async collectComponentInteractionWithCustomFilter(
    channel: TextBasedChannel,
    filter: CollectorFilter<[MessageComponentInteraction]>,
    time = 7000,
  ): Promise<null | MessageComponentInteraction> {
    return channel
      .awaitMessageComponent({ filter, time })
      .then((interaction) => {
        interaction.deferUpdate().catch(() => null);
        return interaction;
      })
      .catch(() => null);
  }

  static async collectComponentInteractionWithStartingId<T extends MessageComponentInteraction>(
    channel: TextBasedChannel,
    authorID: string,
    customId: string | number,
    time?: number,
    defer?: boolean,
  ): Promise<null | T>;

  static async collectComponentInteractionWithStartingId(
    channel: TextBasedChannel,
    authorID: string,
    customId: string | number,
    time = 7000,
    defer = true,
  ): Promise<null | MessageComponentInteraction> {
    return channel
      .awaitMessageComponent({
        filter: (m) => {
          if (m.user.id !== authorID)
            m.reply({
              ephemeral: true,
              content: i18next.getFixedT(m.locale)('common:not-your-interaction'),
            }).catch(() => null);
          else if (defer) m.deferUpdate().catch(() => null);
          return m.user.id === authorID && m.customId.startsWith(`${customId}`);
        },
        time,
      })
      .then((interaction) => interaction)
      .catch(() => null);
  }
}

export const resolveCustomId = (customId: string): string =>
  customId
    .replace(/^[\s\d]+/, '')
    .replace('|', '')
    .trim();

export const resolveSeparatedStrings = (string: string): string[] => string.split(' | ');

export const disableComponents = <T extends MessageButton | MessageSelectMenu>(
  label: string,
  components: T[],
): MessageActionRowComponentResolvable[] =>
  components.map((c) => {
    c.setDisabled(true);
    if (c instanceof MessageSelectMenu) c.setPlaceholder(label);
    else c.setLabel(label);
    return c;
  });

export const actionRow = (components: MessageActionRowComponentResolvable[]): MessageActionRow =>
  new MessageActionRow().setComponents(components);

export const getMagicItemById = <T extends TMagicItemsFile = TMagicItemsFile>(
  id: number,
): IReturnData<T> =>
  Object.entries(MagicItems)
    .filter((a) => Number(a[0]) === id)
    .map((a) => ({ id: Number(a[0]), data: a[1] }))[0];

export const getMagicItemByCustomFilter = (
  filter: (item: [string, TMagicItemsFile]) => boolean,
): IReturnData<TMagicItemsFile> =>
  Object.entries(MagicItems)
    .filter(filter)
    .map((a) => ({ id: Number(a[0]), data: a[1] }))[0];

export const getMillisecondsToTheEndOfDay = (): number => {
  const date = new Date();
  const passedMilli =
    date.getHours() * 3600000 +
    date.getMinutes() * 60000 +
    date.getSeconds() * 1000 +
    date.getMilliseconds();

  return 86400000 - passedMilli;
};

export const debugError = (err: Error, toSentry = true): null => {
  if (process.env.NODE_ENV === 'development') console.error(err.message);
  if (toSentry) Sentry.captureException(err);
  return null;
};

export const negate = (value: number): number => value * -1;

// eslint-disable-next-line no-control-regex
export const toWritableUTF = (str: string): string => str.replace(/[^\x00-\xFF]/g, '');

export const getThemeById = <T extends ThemeFiles = ThemeFiles>(id: number): IReturnData<T> =>
  Object.entries(ImageThemes)
    .filter((a) => Number(a[0]) === id)
    .map((a) => ({ id: Number(a[0]), data: a[1] }))[0];

export const getThemesByType = <T extends ThemeFiles = ThemeFiles>(
  themeType: AvailableThemeTypes,
): IReturnData<T>[] =>
  Object.entries(ImageThemes)
    .filter((a) => a[1].type === themeType)
    .map((a) => ({ id: Number(a[0]), data: a[1] }));

export const getAllThemeUserIds = (
  user: IUserThemesSchema,
): Array<{ id: number; inUse: boolean }> => {
  const allIds: { id: number; inUse: boolean }[] = [];

  user.cardsBackgroundThemes.forEach((a) =>
    allIds.push({ id: a.id, inUse: user.selectedCardBackgroundTheme === a.id }),
  );

  user.cardsThemes.forEach((a) =>
    allIds.push({ id: a.id, inUse: user.selectedCardTheme === a.id }),
  );

  user.profileThemes.forEach((a) =>
    allIds.push({ id: a.id, inUse: user.selectedProfileTheme === a.id }),
  );

  user.tableThemes.forEach((a) =>
    allIds.push({ id: a.id, inUse: user.selectedTableTheme === a.id }),
  );

  return allIds;
};

export type MayNotExists<T> = T | null | undefined;

export const moreThanAnHour = (time: number): boolean => time - Date.now() > 3600000;

export const RandomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const makeCustomId = (
  customIdentifier: string,
  baseId?: number,
): [`${number} | ${string}`, number] => {
  const randomNumber = baseId ?? Math.floor(Date.now() + Math.random() * 100);
  return [`${randomNumber} | ${customIdentifier}`, randomNumber];
};

export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);
