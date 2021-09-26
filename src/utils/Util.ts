import { CollectorFilter, MessageComponentInteraction, TextBasedChannels } from 'discord.js-light';

const MENTION_REGEX = /^(?:<@!?)?([0-9]{16,18})(?:>)?$/;
export default class Util {
  static getIdByMention(mention: string): string | null {
    if (!mention) return null;
    const regexResult = MENTION_REGEX.exec(mention);
    return regexResult && regexResult[1];
  }

  static captalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static async collectComponentInteractionWithStartingId(
    channel: TextBasedChannels,
    authorID: string,
    customId: string,
    time: number,
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

  static async collectComponentInteractionWithId(
    channel: TextBasedChannels,
    authorID: string,
    customId: string,
    time: number,
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

  static async collectComponentInteractionWithCustomFilter(
    channel: TextBasedChannels,
    filter: CollectorFilter<[MessageComponentInteraction]>,
    time: number,
  ): Promise<null | MessageComponentInteraction> {
    return channel
      .awaitMessageComponent({ filter, time })
      .then((interaction) => {
        interaction.deferUpdate().catch(() => null);
        return interaction;
      })
      .catch(() => null);
  }

  static async collectComponentInteraction(
    channel: TextBasedChannels,
    authorID: string,
    time: number,
  ): Promise<null | MessageComponentInteraction> {
    return channel
      .awaitMessageComponent({ filter: (m) => m.user.id === authorID, time })
      .then((interaction) => {
        interaction.deferUpdate().catch(() => null);
        return interaction;
      })
      .catch(() => null);
  }

  static getSecondsToTheEndOfDay(): number {
    const date = new Date();
    const passedSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    return 86400 - passedSeconds;
  }
}
