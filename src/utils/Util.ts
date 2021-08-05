import { MessageComponentInteraction, TextBasedChannels } from 'discord.js';

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

  static async collectComponentInteraction(
    channel: TextBasedChannels,
    authorID: string,
    time: number,
  ): Promise<null | MessageComponentInteraction> {
    return channel
      .awaitMessageComponent({ filter: (m) => m.user.id === authorID, time })
      .then((interaction) => {
        interaction.deferUpdate();
        return interaction;
      })
      .catch(() => null);
  }
}
