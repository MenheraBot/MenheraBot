/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const http = require('../../utils/HTTPrequests');
const Util = require('../../utils/Util');

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
    const { prefix } = server;

    const txt = t('commands:top.txt', { prefix });

    let pagina = 1;

    const argumento = args[0];
    if (!argumento) return message.reply(txt);
    if (args[1]) pagina = parseInt(args[1]);

    const argsDemonios = ['demonios', 'demônios', 'demons'];
    const argsAnjos = ['anjos', 'angels'];
    const argsSemideuses = ['semideuses', 'semi-deuses', 'sd', 'demigods', 'dg'];
    const argsDeuses = ['deuses', 'gods'];
    const argsMamou = ['mamou', 'mamadores', 'suckers'];
    const argsMamados = ['mamados', 'chupados', 'suckled'];
    const argsEstrelinhas = ['estrelinhas', 'estrelinha', 'stars', 'star'];
    const argsVotos = ['votadores', 'voto', 'votes', 'votos', 'upvotes', 'upvote', 'vote'];
    const argsDungeon = ['dungeon', 'rpg'];
    const argsFamilias = ['famílias', 'familias', 'familia', 'família', 'family', 'families'];
    const argsCommands = ['comandos', 'commands', 'cmds', 'cmd'];
    const argsUsers = ['usuarios', 'usuários', 'users', 'user'];

    if (argsMamou.includes(argumento)) {
      this.topMamadores(message, t, pagina);
    } else if (argsMamados.includes(argumento)) {
      this.topMamados(message, t, pagina);
    } else if (argsEstrelinhas.includes(argumento)) {
      this.topEstrelinhas(message, t, pagina);
    } else if (argsDemonios.includes(argumento)) {
      this.topDemonios(message, t, pagina);
    } else if (argsAnjos.includes(argumento)) {
      this.topAnjos(message, t, pagina);
    } else if (argsSemideuses.includes(argumento)) {
      this.topSD(message, t, pagina);
    } else if (argsDeuses.includes(argumento)) {
      this.topDeuses(message, t, pagina);
    } else if (argsVotos.includes(argumento)) {
      this.topVotos(message, t, pagina);
    } else if (argsDungeon.includes(argumento)) {
      this.topDungeon(message, t, pagina);
    } else if (argsFamilias.includes(argumento)) {
      this.topFamilia(message, t);
    } else if (argsCommands.includes(argumento)) {
      TopCommand.topCommands(message, t);
    } else if (argsUsers.includes(argumento)) {
      this.topUsers(message, t);
    } else message.menheraReply('warn', t('commands:top.txt', { prefix }));
  }

  async topMamados(message, t, pagina) {
    const quantidade = await this.client.database.Users.countDocuments();
    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < (quantidade / 10)) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['mamadas', 'nome', 'id'], {
      skip,
      limit: 10,
      sort: { mamadas: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(`👑 | ${t('commands:top.mamouTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#eab3fa');

    for (let i = 0; i < res.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const member = await this.client.users.fetch(res[i].id).catch();
      const memberName = member?.username ?? res[i].id;

      embed.addField(`**${skip + 1 + i} -** ${memberName}`, `${t('commands:top.suckled')}: **${res[i].mamadas}**`, false);
    }
    message.channel.send(message.author, embed);
  }

  async topMamadores(message, t, pagina) {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < (quantidade / 10)) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['mamou', 'nome', 'id'], {
      skip,
      limit: 10,
      sort: { mamou: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(`👑 |  ${t('commands:top.mamadoresTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#eab3fa');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`**${skip + 1 + i} -** ${res[i].nome}`, `${t('commands:top.suck')}: **${res[i].mamou}**`, false);
      } else {
        embed.addField(`**${skip + 1 + i} -** ${member.username}`, `${t('commands:top.suck')}: **${res[i].mamou}**`, false);
      }
    }
    message.channel.send(message.author, embed);
  }

  async topDemonios(message, t, pagina) {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < (quantidade / 10)) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['caçados', 'nome', 'id'], {
      skip,
      limit: 10,
      sort: { caçados: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(`<:DEMON:758765044443381780> |  ${t('commands:top.demonTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#ec8227');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`**${skip + 1 + i} -** ${res[i].nome} `, `${t('commands:top.demons')}: ** ${res[i].caçados}** `, false);
      } else {
        embed.addField(`**${skip + 1 + i} -** ${member.username} `, `${t('commands:top.demons')}: ** ${res[i].caçados}** `, false);
      }
    }
    message.channel.send(message.author, embed);
  }

  async topAnjos(message, t, pagina) {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < (quantidade / 10)) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['anjos', 'nome', 'id'], {
      skip,
      limit: 10,
      sort: { anjos: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(`<:ANGEL:758765044204437535> | ${t('commands:top.angelTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#bdecee');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** ${res[i].nome} `, `${t('commands:top.angels')}: ** ${res[i].anjos}** `, false);
      } else {
        embed.addField(`** ${skip + 1 + i} -** ${member.username} `, `${t('commands:top.angels')}: ** ${res[i].anjos}** `, false);
      }
    }
    message.channel.send(message.author, embed);
  }

  async topSD(message, t, pagina) {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < (quantidade / 10)) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['semideuses', 'nome', 'id'], {
      skip,
      limit: 10,
      sort: { semideuses: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(`<:SEMIGOD:758766732235374674> | ${t('commands:top.sdTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#eab3fa');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** ${res[i].nome} `, `${t('commands:top.demigods')}: ** ${res[i].semideuses}** `, false);
      } else {
        embed.addField(`** ${skip + 1 + i} -** ${member.username} `, `${t('commands:top.demigods')}: ** ${res[i].semideuses}** `, false);
      }
    }
    message.channel.send(message.author, embed);
  }

  async topDeuses(message, t, pagina) {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < (quantidade / 10)) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['deuses', 'nome', 'id'], {
      skip,
      limit: 10,
      sort: { deuses: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(`<:God:758474639570894899> | ${t('commands:top.godTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#a67cec');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** ${res[i].nome} `, `${t('commands:top.gods')}: ** ${res[i].deuses}** `, false);
      } else {
        embed.addField(`** ${skip + 1 + i} -** ${member.username} `, `${t('commands:top.gods')}: ** ${res[i].deuses}** `, false);
      }
    }
    message.channel.send(message.author, embed);
  }

  async topEstrelinhas(message, t, pagina) {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < (quantidade / 10)) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['estrelinhas', 'nome', 'id'], {
      skip,
      limit: 10,
      sort: { estrelinhas: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(`⭐ | ${t('commands:top.starsTitle')} ${(pagina > 1) ? pagina : 1} º`)
      .setColor('#74bd63');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** ${res[i].nome} `, `${t('commands:top.stars')}: ** ${res[i].estrelinhas}** `, false);
      } else {
        embed.addField(`** ${skip + 1 + i} -** ${member.username} `, `${t('commands:top.stars')}: ** ${res[i].estrelinhas}** `, false);
      }
    }
    message.channel.send(message.author, embed);
  }

  async topVotos(message, t, pagina) {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < (quantidade / 10)) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['votos', 'nome', 'id'], {
      skip,
      limit: 10,
      sort: { votos: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(`<:ok:727975974125436959> | ${t('commands:top.voteTitle')} ${(pagina > 1) ? pagina : 1} º`)
      .setColor('#ff29ae');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** ${res[i].nome} `, `Upvotes: ** ${res[i].votos}** `, false);
      } else {
        embed.addField(`** ${skip + 1 + i} -** ${member.username} `, `Upvotes: ** ${res[i].votos}** `, false);
      }
    }
    message.channel.send(message.author, embed);
  }

  async topDungeon(message, t, pagina) {
    const quantidade = await this.client.database.Rpg.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < (quantidade / 10)) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Rpg.find({}, ['level', '_id', 'xp'], {
      skip,
      limit: 10,
      sort: { level: -1, xp: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(`<:Chest:760957557538947133> | ${t('commands:top.rpgTitle')} ${(pagina > 1) ? pagina : 1} º`)
      .setColor('#a1f5ee');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** \`USER NOT FOUND\``, `Level: **${res[i].level}**\nXp: **${res[i].xp}**`, false);
      } else {
        embed.addField(`**${skip + 1 + i} -** ${member.username}`, `Level: **${res[i].level}**\nXp: **${res[i].xp}**`, false);
      }
    }
    message.channel.send(message.author, embed);
  }

  async topFamilia(message, t) {
    const embed = new MessageEmbed()

      .setTitle(`🔱 | ${t('commands:top.familyTitle')}`)
      .setColor('#c780f3');

    const res = await this.client.database.Familias.find({}, ['_id', 'members', 'levelFamilia', 'bank'], {
      skip: 0,
      limit: 5,
      sort: { levelFamilia: -1, bank: -1 },
    });

    res.sort((a, b) => parseInt(b.bank) - parseInt(a.bank));

    for (let i = 0; i < res.length; i++) {
      embed.addField(`${i + 1} - ${res[i]._id}`, `:fleur_de_lis: | **${t('commands:top.family-level')}:** ${res[i].levelFamilia}\n💎 | **${t('commands:top.family-money')}:** ${res[i].bank}\n<:God:758474639570894899> | **${t('commands:top.memebrs')}:** ${res[i].members.length}`);
    }
    message.channel.send(message.author, embed);
  }

  static async topCommands(message, t) {
    const res = await http.getTopCommands();
    const embed = new MessageEmbed()

      .setTitle(`:robot: |  ${t('commands:top.commands')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      embed.addField(`**${i + 1} -** ${Util.captalize(res[i].name)} `, `${t('commands:top.used')} **${res[i].usages}** ${t('commands:top.times')}`, false);
    }
    message.channel.send(message.author, embed);
  }

  async topUsers(message, t) {
    const res = await http.getTopUsers();
    const embed = new MessageEmbed()

      .setTitle(`<:MenheraSmile2:767210250364780554> |  ${t('commands:top.users')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      embed.addField(`**${i + 1} -** ${Util.captalize(member.username)} `, `${t('commands:top.use')} **${res[i].uses}** ${t('commands:top.times')}`, false);
    }
    message.channel.send(message.author, embed);
  }
};
