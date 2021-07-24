import { Guild, GuildMember, User } from 'discord.js';
import MenheraClient from 'MenheraClient';

const MENTION_REGEX = /^(?:<@!?)?([0-9]{16,18})(?:>)?$/;
export default class Util {
  static getIdByMention(mention: string): string {
    if (!mention) return null;
    const regexResult = MENTION_REGEX.exec(mention);
    return regexResult && regexResult[1];
  }

  static async databaseEnsure(
    model,
    query: { id: string },
    defaultValue: { id: string; shipValue?: number },
  ) {
    return (await model.findOne(query)) ?? model.create(defaultValue);
  }

  static async databaseUserEnsure(client: MenheraClient, userOrMember: GuildMember | User) {
    const user = userOrMember instanceof User ? userOrMember : userOrMember.user;
    const defaultValue = {
      id: user.id,
      shipValue: Math.floor(Math.random() * 55),
    };
    return Util.databaseEnsure(client.database.Users, { id: user.id }, defaultValue);
  }

  static async databaseGuildEnsure(client: MenheraClient, guild: Guild) {
    const { id } = guild;
    return Util.databaseEnsure(client.database.Guilds, { id }, { id });
  }

  static captalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
