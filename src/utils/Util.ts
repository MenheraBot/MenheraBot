import {
  CollectorFilter,
  MessageComponentInteraction,
  MessageButton,
  MessageSelectMenu,
  MessageActionRow,
  MessageActionRowComponentResolvable,
  TextBasedChannels,
} from 'discord.js-light';

const MENTION_REGEX = /^(?:<@!?)?(\d{16,18})(?:>)?$/;
export default class Util {
  static getIdByMention(mention: string): string | null {
    if (!mention) return null;
    const regexResult = MENTION_REGEX.exec(mention);
    return regexResult?.[1] ?? null;
  }

  static captalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static async collectComponentInteractionWithId<T extends MessageComponentInteraction>(
    channel: TextBasedChannels,
    authorID: string,
    customId: string,
    time?: number,
  ): Promise<null | T>;

  static async collectComponentInteractionWithId(
    channel: TextBasedChannels,
    authorID: string,
    customId: string,
    time = 7000,
  ): Promise<null | MessageComponentInteraction> {
    return channel
      .awaitMessageComponent({
        filter: (m) => m.user.id === authorID && m.customId === customId,
        time,
      })
      .then((interaction) => {
        interaction.deferUpdate().catch(() => null);
        return interaction;
      })
      .catch(() => null);
  }

  static async collectComponentInteractionWithCustomFilter<T extends MessageComponentInteraction>(
    channel: TextBasedChannels,
    filter: CollectorFilter<[T]>,
    time?: number,
  ): Promise<null | T>;

  static async collectComponentInteractionWithCustomFilter(
    channel: TextBasedChannels,
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

  static async collectComponentInteraction<T extends MessageComponentInteraction>(
    channel: TextBasedChannels,
    authorID: string,
    time?: number,
  ): Promise<null | T>;

  static async collectComponentInteraction(
    channel: TextBasedChannels,
    authorID: string,
    time = 7000,
  ): Promise<null | MessageComponentInteraction> {
    return channel
      .awaitMessageComponent({ filter: (m) => m.user.id === authorID, time })
      .then((interaction) => {
        interaction.deferUpdate().catch(() => null);
        return interaction;
      })
      .catch(() => null);
  }

  static async collectComponentInteractionWithStartingId<T extends MessageComponentInteraction>(
    channel: TextBasedChannels,
    authorID: string,
    customId: string,
    time?: number,
  ): Promise<null | T>;

  static async collectComponentInteractionWithStartingId(
    channel: TextBasedChannels,
    authorID: string,
    customId: string,
    time = 7000,
  ): Promise<null | MessageComponentInteraction> {
    return channel
      .awaitMessageComponent({
        filter: (m) => m.user.id === authorID && m.customId.startsWith(customId),
        time,
      })
      .then((interaction) => {
        interaction.deferUpdate();
        return interaction;
      })
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
): T[] =>
  components.map((c) => {
    c.setDisabled(true);
    if (c instanceof MessageSelectMenu) c.setPlaceholder(label);
    else c.setLabel(label);
    return c;
  });

export const actionRow = (components: MessageActionRowComponentResolvable[]): MessageActionRow =>
  new MessageActionRow({ components });
