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

  async run(ctx) {
    const { prefix } = ctx.data.server;

    let pagina = 1;

    const argumento = ctx.args[0];
    if (!argumento) return ctx.replyT('error', 'commands:top.txt', { prefix });
    if (ctx.args[1]) pagina = parseInt(ctx.args[1]);

    const argsDemonios = ['demonios', 'demônios', 'demons'];
    const argsAnjos = ['anjos', 'angels'];
    const argsSemideuses = ['semideuses', 'semi-deuses', 'sd', 'demigods', 'dg'];
    const argsDeuses = ['deuses', 'gods'];
    const argsMamou = ['mamou', 'mamadores', 'suckers'];
    const argsMamados = ['mamados', 'chupados', 'suckled'];
    const argsEstrelinhas = ['estrelinhas', 'estrelinha', 'stars', 'star'];
    const argsVotos = ['votadores', 'voto', 'votes', 'votos', 'upvotes', 'upvote', 'vote'];
    const argsDungeon = ['dungeon', 'rpg'];
    const argsCommands = ['comandos', 'commands', 'cmds', 'cmd'];
    const argsUsers = ['usuarios', 'usuários', 'users'];
    const argsUser = ['usuario', 'user', 'usuário'];

    if (argsMamou.includes(argumento)) {
      this.topMamadores(ctx, pagina);
    } else if (argsMamados.includes(argumento)) {
      this.topMamados(ctx, pagina);
    } else if (argsEstrelinhas.includes(argumento)) {
      this.topEstrelinhas(ctx, pagina);
    } else if (argsDemonios.includes(argumento)) {
      this.topDemonios(ctx, pagina);
    } else if (argsAnjos.includes(argumento)) {
      this.topAnjos(ctx, pagina);
    } else if (argsSemideuses.includes(argumento)) {
      this.topSD(ctx, pagina);
    } else if (argsDeuses.includes(argumento)) {
      this.topDeuses(ctx, pagina);
    } else if (argsVotos.includes(argumento)) {
      this.topVotos(ctx, pagina);
    } else if (argsDungeon.includes(argumento)) {
      this.topDungeon(ctx, pagina);
    } else if (argsCommands.includes(argumento)) {
      TopCommand.topCommands(ctx);
    } else if (argsUsers.includes(argumento)) {
      this.topUsers(ctx);
    } else if (argsUser.includes(argumento)) {
      this.topUser(ctx);
    } else ctx.replyT('warn', 'commands:top.txt', { prefix });
  }

  async topMamados(ctx, pagina) {
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

      .setTitle(`👑 | ${ctx.locale('commands:top.mamouTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#eab3fa');

    for (let i = 0; i < res.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const member = await this.client.users.fetch(res[i].id).catch();
      const memberName = member?.username ?? res[i].id;

      embed.addField(`**${skip + 1 + i} -** ${memberName}`, `${ctx.locale('commands:top.suckled')}: **${res[i].mamadas}**`, false);
    }
    ctx.sendC(ctx.message.author, embed);
  }

  async topMamadores(ctx, pagina) {
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

      .setTitle(`👑 |  ${ctx.locale('commands:top.mamadoresTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#eab3fa');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`**${skip + 1 + i} -** ${res[i].nome}`, `${ctx.locale('commands:top.suck')}: **${res[i].mamou}**`, false);
      } else {
        embed.addField(`**${skip + 1 + i} -** ${member.username}`, `${ctx.locale('commands:top.suck')}: **${res[i].mamou}**`, false);
      }
    }
    ctx.sendC(ctx.message.author, embed);
  }

  async topDemonios(ctx, pagina) {
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

      .setTitle(`<:DEMON:758765044443381780> |  ${ctx.locale('commands:top.demonTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#ec8227');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`**${skip + 1 + i} -** ${res[i].nome} `, `${ctx.locale('commands:top.demons')}: ** ${res[i].caçados}** `, false);
      } else {
        embed.addField(`**${skip + 1 + i} -** ${member.username} `, `${ctx.locale('commands:top.demons')}: ** ${res[i].caçados}** `, false);
      }
    }
    ctx.sendC(ctx.message.author, embed);
  }

  async topAnjos(ctx, pagina) {
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

      .setTitle(`<:ANGEL:758765044204437535> | ${ctx.locale('commands:top.angelTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#bdecee');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** ${res[i].nome} `, `${ctx.locale('commands:top.angels')}: ** ${res[i].anjos}** `, false);
      } else {
        embed.addField(`** ${skip + 1 + i} -** ${member.username} `, `${ctx.locale('commands:top.angels')}: ** ${res[i].anjos}** `, false);
      }
    }
    ctx.sendC(ctx.message.author, embed);
  }

  async topSD(ctx, pagina) {
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

      .setTitle(`<:SEMIGOD:758766732235374674> | ${ctx.locale('commands:top.sdTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#eab3fa');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** ${res[i].nome} `, `${ctx.locale('commands:top.demigods')}: ** ${res[i].semideuses}** `, false);
      } else {
        embed.addField(`** ${skip + 1 + i} -** ${member.username} `, `${ctx.locale('commands:top.demigods')}: ** ${res[i].semideuses}** `, false);
      }
    }
    ctx.sendC(ctx.message.author, embed);
  }

  async topDeuses(ctx, pagina) {
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

      .setTitle(`<:God:758474639570894899> | ${ctx.locale('commands:top.godTitle')} ${(pagina > 1) ? pagina : 1}º`)
      .setColor('#a67cec');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** ${res[i].nome} `, `${ctx.locale('commands:top.gods')}: ** ${res[i].deuses}** `, false);
      } else {
        embed.addField(`** ${skip + 1 + i} -** ${member.username} `, `${ctx.locale('commands:top.gods')}: ** ${res[i].deuses}** `, false);
      }
    }
    ctx.sendC(ctx.message.author, embed);
  }

  async topEstrelinhas(ctx, pagina) {
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
      .setTitle(`⭐ | ${ctx.locale('commands:top.starsTitle')} ${(pagina > 1) ? pagina : 1} º`)
      .setColor('#74bd63');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** ${res[i].nome} `, `${ctx.locale('commands:top.stars')}: ** ${res[i].estrelinhas}** `, false);
      } else {
        embed.addField(`** ${skip + 1 + i} -** ${member.username} `, `${ctx.locale('commands:top.stars')}: ** ${res[i].estrelinhas}** `, false);
      }
    }
    ctx.sendC(ctx.message.author, embed);
  }

  async topVotos(ctx, pagina) {
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

      .setTitle(`<:ok:727975974125436959> | ${ctx.locale('commands:top.voteTitle')} ${(pagina > 1) ? pagina : 1} º`)
      .setColor('#ff29ae');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** ${res[i].nome} `, `Upvotes: ** ${res[i].votos}** `, false);
      } else {
        embed.addField(`** ${skip + 1 + i} -** ${member.username} `, `Upvotes: ** ${res[i].votos}** `, false);
      }
    }
    ctx.sendC(ctx.message.author, embed);
  }

  async topDungeon(ctx, pagina) {
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

      .setTitle(`<:Chest:760957557538947133> | ${ctx.locale('commands:top.rpgTitle')} ${(pagina > 1) ? pagina : 1} º`)
      .setColor('#a1f5ee');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(`** ${skip + 1 + i} -** \`USER NOT FOUND\``, `Level: **${res[i].level}**\nXp: **${res[i].xp}**`, false);
      } else {
        embed.addField(`**${skip + 1 + i} -** ${member.username}`, `Level: **${res[i].level}**\nXp: **${res[i].xp}**`, false);
      }
    }
    ctx.sendC(ctx.message.author, embed);
  }

  static async topCommands(ctx) {
    const res = await http.getTopCommands();
    const embed = new MessageEmbed()

      .setTitle(`:robot: |  ${ctx.locale('commands:top.commands')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      embed.addField(`**${i + 1} -** ${Util.captalize(res[i].name)} `, `${ctx.locale('commands:top.used')} **${res[i].usages}** ${ctx.locale('commands:top.times')}`, false);
    }
    ctx.sendC(ctx.message.author, embed);
  }

  async topUsers(ctx) {
    const res = await http.getTopUsers();
    const embed = new MessageEmbed()

      .setTitle(`<:MenheraSmile2:767210250364780554> |  ${ctx.locale('commands:top.users')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      embed.addField(`**${i + 1} -** ${Util.captalize(member.username)} `, `${ctx.locale('commands:top.use')} **${res[i].uses}** ${ctx.locale('commands:top.times')}`, false);
    }
    ctx.sendC(ctx.message.author, embed);
  }

  async topUser(ctx) {
    const user = ctx.args[1] ? ctx.args[1].replace(/[<@!>]/g, '') : ctx.message.author.id;

    let fetchedUser;

    try {
      fetchedUser = await this.client.users.fetch(user).catch();
    } catch {
      return ctx.replyT('error', 'commands:top.not-user');
    }

    const res = await http.getProfileCommands(fetchedUser.id);
    const embed = new MessageEmbed()

      .setTitle(`<:MenheraSmile2:767210250364780554> |  ${ctx.locale('commands:top.user', { user: fetchedUser.username })}`)
      .setColor('#f47fff');

    if (!res || res.cmds.count === 0) return ctx.replyT('error', 'commands:top.not-user');

    for (let i = 0; i < res.array.length; i++) {
      if (i > 10) break;
      embed.addField(`**${i + 1} -** ${Util.captalize(res.array[i].name)} `, `${ctx.locale('commands:top.use')} **${res.array[i].count}** ${ctx.locale('commands:top.times')}`, false);
    }
    ctx.sendC(ctx.message.author, embed);
  }
};
