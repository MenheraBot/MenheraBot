const { User } = require('discord.js');

const MENTION_REGEX = /^(?:<@!?)?([0-9]{16,18})(?:>)?$/;
module.exports = class Util {
  static getIdByMention(mention) {
    if (!mention) return null;
    const regexResult = MENTION_REGEX.exec(mention);
    return regexResult && regexResult[1];
  }

  static async databaseEnsure(model, query, defaultValue) {
    return (await model.findOne(query)) ?? model.create(defaultValue);
  }

  static async databaseUserEnsure(client, userOrMember) {
    const user = userOrMember instanceof User ? userOrMember : userOrMember.user;
    const defaultValue = {
      id: user.id,
      shipValue: Math.floor(Math.random() * 55),
    };
    return Util.databaseEnsure(client.database.Users, { id: user.id }, defaultValue);
  }

  static async databaseGuildEnsure(client, guild) {
    const { id } = guild;
    return Util.databaseEnsure(client.database.Guilds, { id }, { id });
  }

  static captalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};
