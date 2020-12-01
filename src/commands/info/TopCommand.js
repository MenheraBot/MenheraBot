/* eslint-disable no-await-in-loop */
const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const Util = require('../../utils/Util');

const getOptions = (value, options) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const entry of options) {
    if (Array.isArray(entry)) {
      if (entry.some((t) => t === value)) {
        return entry[0];
      }
    } else if (entry === value) {
      return entry;
    }
  }
  return null;
};

module.exports = class TopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'top',
      aliases: ['rank'],
      cooldown: 7,
      clientPermissions: ['EMBED_LINKS'],
      category: 'info',
    });
  }

  async run({ message, args, server }, t) {
    const choose = args[0]?.toLowerCase();
    const page = parseInt(args[1]) || 1;

    const options = [
      ['demon', 'demonios', 'demônios', 'demons'],
      ['demigod', 'semideuses', 'semi-deuses', 'sd', 'demigods', 'dg'],
      ['sucker', 'mamou', 'mamadores', 'suckers'],
      ['god', 'deuses', 'gods'],
      ['suckled', 'mamados', 'chupados'],
      ['star', 'estrelinhas', 'estrelinha', 'stars'],
      ['vote', 'votadores', 'voto', 'votes', 'votos', 'upvotes', 'upvote'],
      ['dungeon', 'rpg'],
      ['family', 'famílias', 'familias', 'familia', 'família', 'families'],
      'assassino', 'barbaro', 'clerigo', 'druida', 'espadachim', 'feiticeiro', 'monge', 'necromante',
    ];

    const option = getOptions(choose, options);

    if (!option) {
      const chooseOption = options
        .map((v) => `\`${server.prefix}${this.config.name} ${v[0]}\``)
        .join(', ');
      return message.reply(t('commands:top.txt', { options: chooseOption }));
    }

    const queryPage = (model, query, ...fields) => {
      const limit = 10;
      const skip = (page - 1) * limit;
      const ASC = -1;
      const sort = fields.reduce((p, v) => ({ ...p, [v]: ASC }), {});
      return model.find(query, [...fields, 'id', '_id'], { skip, sort, limit });
    };

    switch (option) {
      case 'demon': {
        const users = await queryPage(this.client.database.Users, {}, 'caçados');
        this.sendUserRanking(
          message, users, page,
          t('commands:top.demonTitle'), (user) => `Demonios: ${user.caçados}`,
        );
        break;
      }

      case 'demigod': {
        const users = await queryPage(this.client.database.Users, {}, 'semideuses');
        this.sendUserRanking(
          message, users, page,
          t('commands:top.demonTitle'), (user) => `Demonios: ${user.caçados}`,
        );
        break;
      }

      case 'sucker': {
        const users = await queryPage(this.client.database.Users, {}, 'mamou');
        this.sendUserRanking(
          message, users, page,
          t('commands:top.mamouTitle'), (user) => `Mamou: ${user.mamou}`,
        );
        break;
      }

      case 'god': {
        const users = await queryPage(this.client.database.Users, {}, 'deuses');
        this.sendUserRanking(
          message, users, page,
          t('commands:top.godTitle'), (user) => `Deuses: ${user.deuses}`,
        );
        break;
      }

      case 'suckled': {
        const users = await queryPage(this.client.database.Users, {}, 'mamadas');
        this.sendUserRanking(
          message, users, page,
          t('commands:top.mamouTitle'), (user) => `Mamado: ${user.mamadas}`,
        );
        break;
      }

      case 'star': {
        const users = await queryPage(this.client.database.Users, {}, 'estrelinhas');
        this.sendUserRanking(
          message, users, page,
          t('commands:top.starsTitle'), (user) => `Estrelinhas: ${user.estrelinhas}`,
        );
        break;
      }

      case 'vote': {
        const users = await queryPage(this.client.database.Users, {}, 'votos');
        this.sendUserRanking(
          message, users, page,
          t('commands:top.voteTitle'), (user) => `Upvotes: ${user.votos}`,
        );
        break;
      }

      case 'dungeon': {
        const users = await queryPage(this.client.database.Rpg, {}, 'level', 'xp');
        this.sendUserRanking(
          message, users, page,
          t('commands:top.rpgTitle'), (user) => `Level: **${user.level}**\nXp: **${user.xp}**`,
        );
        break;
      }

      case 'family': {
        const families = await queryPage(this.client.database.Rpg, {}, 'members', 'levelFamilia', 'bank');
        this.sendRanking(
          message, families, page,
          t('commands:top.familyTitle'), (family, pos) => [
            `${pos} - ${family._id}`,
            `:fleur_de_lis: | **Nível da Família:** ${family.levelFamilia}\n💎 | **Dinheiro da Família:** ${family.bank}\n<:God:758474639570894899> | **Membros:** ${family.members.length}`,
          ],
        );
        break;
      }

      // top Classe
      default: {
        const users = await queryPage(this.client.database.Rpg, { class: option }, 'level', 'xp');
        this.sendUserRanking(
          message, users, page,
          t('commands:top.classeTitle', { classe: Util.capitaze(option) }),
          (user) => `Level: **${user.level}**\nXp: **${user.xp}**`,
        );
        break;
      }
    }
  }

  static async sendRanking(message, data, page, title, field) {
    const embed = new MessageEmbed()
      .setTitle(title)
      .setColor('#eab3fa');

    const position = (page > 9) ? page + 1 : 1;
    for (let i = 0; i < data.length; i++) {
      const [name, value] = await field(data[i], position + i);
      embed.addField(name, value, false);
    }

    return message.channel.send(message.author, embed);
  }

  async sendUserRanking(message, users, page, title, field) {
    return TopCommand.sendRanking(message, users, page, `👑 | ${title} 1º`, async (user, pos) => {
      const userId = user?.id ?? user?._id;
      const member = await this.client.users.fetch(userId).catch();
      const memberName = member?.username ?? userId;
      return [`**${pos} -** ${memberName}`, field(user)];
    });
  }
};
