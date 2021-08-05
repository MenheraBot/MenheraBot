/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import CommandContext from '@structures/CommandContext';
import { Message, MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '../../../structures/Command';
import http from '../../../utils/HTTPrequests';
import Util from '../../../utils/Util';

export default class TopCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'top',
      aliases: ['rank'],
      cooldown: 7,
      clientPermissions: ['EMBED_LINKS'],
      category: 'info',
    });
  }

  static async topCommands(ctx: CommandContext): Promise<Message | Message[]> {
    const res = await http.getTopCommands();
    if (!res) return ctx.replyT('error', 'commands:http-error');
    const embed = new MessageEmbed()

      .setTitle(`:robot: |  ${ctx.locale('commands:top.commands')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      embed.addField(
        `**${i + 1} -** ${Util.captalize(res[i].name)} `,
        `${ctx.locale('commands:top.used')} **${res[i].usages}** ${ctx.locale(
          'commands:top.times',
        )}`,
        false,
      );
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async run(ctx: CommandContext): Promise<void> {
    const { prefix } = ctx.data.server;

    let pagina = 1;

    const argumento = ctx.args[0];
    if (!argumento) {
      await ctx.replyT('error', 'commands:top.txt', { prefix });
      return;
    }
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
      await this.topMamadores(ctx, pagina);
      return;
    }
    if (argsMamados.includes(argumento)) {
      await this.topMamados(ctx, pagina);
      return;
    }
    if (argsEstrelinhas.includes(argumento)) {
      await this.topEstrelinhas(ctx, pagina);
      return;
    }
    if (argsDemonios.includes(argumento)) {
      await this.topDemonios(ctx, pagina);
      return;
    }
    if (argsAnjos.includes(argumento)) {
      await this.topAnjos(ctx, pagina);
      return;
    }
    if (argsSemideuses.includes(argumento)) {
      await this.topSD(ctx, pagina);
      return;
    }
    if (argsDeuses.includes(argumento)) {
      await this.topDeuses(ctx, pagina);
      return;
    }
    if (argsVotos.includes(argumento)) {
      await this.topVotos(ctx, pagina);
      return;
    }
    if (argsDungeon.includes(argumento)) {
      const validClasses = [
        {
          option: 'Assassino',
          arguments: ['assassino', 'assassin', 'a'],
        },
        {
          option: 'Bárbaro',
          arguments: ['bárbaro', 'barbaro', 'barbarian', 'b'],
        },
        {
          option: 'Clérigo',
          arguments: ['clérigo', 'clerigo', 'cleric', 'c'],
        },
        {
          option: 'Druida',
          arguments: ['druida', 'druid', 'd'],
        },
        {
          option: 'Espadachim',
          arguments: ['espadachim', 'swordman', 'e', 'sw'],
        },
        {
          option: 'Feiticeiro',
          arguments: ['feiticeiro', 'sorcerer', 'so'],
        },
        {
          option: 'Monge',
          arguments: ['monge', 'monk', 'm'],
        },
        {
          option: 'Necromante',
          arguments: ['necromante', 'necromancer', 'n'],
        },
      ];

      const filtredOption = ctx.args[1]
        ? validClasses.filter((so) => so.arguments.includes(ctx.args[1].toLowerCase()))
        : [];

      const option = filtredOption.length > 0 ? filtredOption[0].option : false;

      if (option) {
        await this.topDungeon(ctx, pagina, option);
        return;
      }
      await this.topDungeon(ctx, pagina, false);
      return;
    }
    if (argsCommands.includes(argumento)) {
      await TopCommand.topCommands(ctx);
      return;
    }
    if (argsUsers.includes(argumento)) {
      await this.topUsers(ctx);
      return;
    }
    if (argsUser.includes(argumento)) {
      await this.topUser(ctx);
      return;
    }
    await ctx.replyT('warn', 'commands:top.txt', { prefix });
  }

  async topMamados(ctx: CommandContext, pagina: number): Promise<Message | Message[]> {
    const quantidade = await this.client.database.Users.countDocuments();
    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < quantidade / 10) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['mamadas', 'id'], {
      skip,
      limit: 10,
      sort: { mamadas: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(`👑 | ${ctx.locale('commands:top.mamouTitle')} ${pagina > 1 ? pagina : 1}º`)
      .setColor('#eab3fa');

    for (let i = 0; i < res.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const member = await this.client.users.fetch(res[i].id).catch();
      const memberName = member?.username ?? res[i].id;

      embed.addField(
        `**${skip + 1 + i} -** ${memberName}`,
        `${ctx.locale('commands:top.suckled')}: **${res[i].mamadas}**`,
        false,
      );
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async topMamadores(ctx: CommandContext, pagina: number): Promise<Message | Message[]> {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < quantidade / 10) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['mamou', 'id'], {
      skip,
      limit: 10,
      sort: { mamou: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(`👑 |  ${ctx.locale('commands:top.mamadoresTitle')} ${pagina > 1 ? pagina : 1}º`)
      .setColor('#eab3fa');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(
          `**${skip + 1 + i} -** ${res[i].id}`,
          `${ctx.locale('commands:top.suck')}: **${res[i].mamou}**`,
          false,
        );
      } else {
        embed.addField(
          `**${skip + 1 + i} -** ${member.username}`,
          `${ctx.locale('commands:top.suck')}: **${res[i].mamou}**`,
          false,
        );
      }
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async topDemonios(ctx: CommandContext, pagina: number): Promise<Message | Message[]> {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < quantidade / 10) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['caçados', 'id'], {
      skip,
      limit: 10,
      sort: { caçados: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(
        `<:DEMON:758765044443381780> |  ${ctx.locale('commands:top.demonTitle')} ${
          pagina > 1 ? pagina : 1
        }º`,
      )
      .setColor('#ec8227');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(
          `**${skip + 1 + i} -** ${res[i].id} `,
          `${ctx.locale('commands:top.demons')}: ** ${res[i].caçados}** `,
          false,
        );
      } else {
        embed.addField(
          `**${skip + 1 + i} -** ${member.username} `,
          `${ctx.locale('commands:top.demons')}: ** ${res[i].caçados}** `,
          false,
        );
      }
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async topAnjos(ctx: CommandContext, pagina: number): Promise<Message | Message[]> {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < quantidade / 10) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['anjos', 'id'], {
      skip,
      limit: 10,
      sort: { anjos: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(
        `<:ANGEL:758765044204437535> | ${ctx.locale('commands:top.angelTitle')} ${
          pagina > 1 ? pagina : 1
        }º`,
      )
      .setColor('#bdecee');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(
          `** ${skip + 1 + i} -** ${res[i].id} `,
          `${ctx.locale('commands:top.angels')}: ** ${res[i].anjos}** `,
          false,
        );
      } else {
        embed.addField(
          `** ${skip + 1 + i} -** ${member.username} `,
          `${ctx.locale('commands:top.angels')}: ** ${res[i].anjos}** `,
          false,
        );
      }
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async topSD(ctx: CommandContext, pagina: number): Promise<Message | Message[]> {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < quantidade / 10) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['semideuses', 'id'], {
      skip,
      limit: 10,
      sort: { semideuses: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(
        `<:SEMIGOD:758766732235374674> | ${ctx.locale('commands:top.sdTitle')} ${
          pagina > 1 ? pagina : 1
        }º`,
      )
      .setColor('#eab3fa');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(
          `** ${skip + 1 + i} -** ${res[i].id} `,
          `${ctx.locale('commands:top.demigods')}: ** ${res[i].semideuses}** `,
          false,
        );
      } else {
        embed.addField(
          `** ${skip + 1 + i} -** ${member.username} `,
          `${ctx.locale('commands:top.demigods')}: ** ${res[i].semideuses}** `,
          false,
        );
      }
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async topDeuses(ctx: CommandContext, pagina: number): Promise<Message | Message[]> {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < quantidade / 10) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['deuses', 'id'], {
      skip,
      limit: 10,
      sort: { deuses: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(
        `<:God:758474639570894899> | ${ctx.locale('commands:top.godTitle')} ${
          pagina > 1 ? pagina : 1
        }º`,
      )
      .setColor('#a67cec');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(
          `** ${skip + 1 + i} -** ${res[i].id} `,
          `${ctx.locale('commands:top.gods')}: ** ${res[i].deuses}** `,
          false,
        );
      } else {
        embed.addField(
          `** ${skip + 1 + i} -** ${member.username} `,
          `${ctx.locale('commands:top.gods')}: ** ${res[i].deuses}** `,
          false,
        );
      }
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async topEstrelinhas(ctx: CommandContext, pagina: number): Promise<Message | Message[]> {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < quantidade / 10) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['estrelinhas', 'id'], {
      skip,
      limit: 10,
      sort: { estrelinhas: -1 },
    });

    const embed = new MessageEmbed()
      .setTitle(`⭐ | ${ctx.locale('commands:top.starsTitle')} ${pagina > 1 ? pagina : 1} º`)
      .setColor('#74bd63');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(
          `** ${skip + 1 + i} -** ${res[i].id} `,
          `${ctx.locale('commands:top.stars')}: ** ${res[i].estrelinhas}** `,
          false,
        );
      } else {
        embed.addField(
          `** ${skip + 1 + i} -** ${member.username} `,
          `${ctx.locale('commands:top.stars')}: ** ${res[i].estrelinhas}** `,
          false,
        );
      }
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async topVotos(ctx: CommandContext, pagina: number): Promise<Message | Message[]> {
    const quantidade = await this.client.database.Users.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < quantidade / 10) {
      skip = (pagina - 1) * 10;
    }

    const res = await this.client.database.Users.find({}, ['votos', 'id'], {
      skip,
      limit: 10,
      sort: { votos: -1 },
    });

    const embed = new MessageEmbed()

      .setTitle(
        `<:ok:727975974125436959> | ${ctx.locale('commands:top.voteTitle')} ${
          pagina > 1 ? pagina : 1
        } º`,
      )
      .setColor('#ff29ae');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      if (!member) {
        embed.addField(
          `** ${skip + 1 + i} -** ${res[i].id} `,
          `Upvotes: ** ${res[i].votos}** `,
          false,
        );
      } else {
        embed.addField(
          `** ${skip + 1 + i} -** ${member.username} `,
          `Upvotes: ** ${res[i].votos}** `,
          false,
        );
      }
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async topDungeon(
    ctx: CommandContext,
    pagina: number,
    classToSearch: string | false,
  ): Promise<Message | Message[]> {
    const quantidade = await this.client.database.Rpg.countDocuments();

    let skip = 0;
    if (!Number.isNaN(pagina) && pagina > 0 && pagina < quantidade / 10) {
      skip = (pagina - 1) * 10;
    }

    const res = classToSearch
      ? await this.client.database.Rpg.find({ class: classToSearch }, ['level', '_id', 'xp'], {
          skip,
          limit: 10,
          sort: { level: -1, xp: -1 },
        })
      : await this.client.database.Rpg.find({}, ['level', '_id', 'xp', 'class'], {
          skip,
          limit: 10,
          sort: { level: -1, xp: -1 },
        });

    const embed = new MessageEmbed().setColor('#a1f5ee');

    classToSearch
      ? embed.setTitle(
          `<:Chest:760957557538947133> | Top ${ctx.locale(`roleplay:classes.${classToSearch}`)} ${
            skip > 0 ? skip / 10 + 1 : 1
          } º`,
        )
      : embed.setTitle(
          `<:Chest:760957557538947133> | ${ctx.locale('commands:top.rpgTitle')} ${
            skip > 0 ? skip / 10 + 1 : 1
          } º`,
        );

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch(() => null);
      if (!member) {
        classToSearch
          ? embed.addField(
              `** ${skip + 1 + i} -** \`USER NOT FOUND\``,
              `Level: **${res[i].level}**\nXp: **${res[i].xp}**`,
              false,
            )
          : embed.addField(
              `** ${skip + 1 + i} -** \`USER NOT FOUND\`  | ${ctx.locale(
                `roleplay:classes.${res[i].class}`,
              )}`,
              `Level: **${res[i].level}**\nXp: **${res[i].xp}**`,
              false,
            );
      } else {
        classToSearch
          ? embed.addField(
              `**${skip + 1 + i} -** ${member.username}`,
              `Level: **${res[i].level}**\nXp: **${res[i].xp}**`,
              false,
            )
          : embed.addField(
              `**${skip + 1 + i} -** ${member.username} | ${ctx.locale(
                `roleplay:classes.${res[i].class}`,
              )}`,
              `Level: **${res[i].level}**\nXp: **${res[i].xp}**`,
              false,
            );
      }
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async topUsers(ctx: CommandContext): Promise<Message | Message[]> {
    const res = await http.getTopUsers();
    if (!res) return ctx.replyT('error', 'commands:http-error');
    const embed = new MessageEmbed()

      .setTitle(`<:MenheraSmile2:767210250364780554> |  ${ctx.locale('commands:top.users')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      embed.addField(
        `**${i + 1} -** ${Util.captalize(member.username)} `,
        `${ctx.locale('commands:top.use')} **${res[i].uses}** ${ctx.locale('commands:top.times')}`,
        false,
      );
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }

  async topUser(ctx: CommandContext): Promise<Message | Message[]> {
    const user = ctx.args[1] ? ctx.args[1].replace(/[<@!>]/g, '') : ctx.message.author.id;

    let fetchedUser;

    try {
      fetchedUser = await this.client.users.fetch(user).catch();
    } catch {
      return ctx.replyT('error', 'commands:top.not-user');
    }

    const res = await http.getProfileCommands(fetchedUser.id);
    const embed = new MessageEmbed()

      .setTitle(
        `<:MenheraSmile2:767210250364780554> |  ${ctx.locale('commands:top.user', {
          user: fetchedUser.username,
        })}`,
      )
      .setColor('#f47fff');

    if (!res || res.cmds.count === 0) return ctx.replyT('error', 'commands:top.not-user');

    for (let i = 0; i < res.array.length; i++) {
      if (i > 10) break;
      embed.addField(
        `**${i + 1} -** ${Util.captalize(res.array[i].name)} `,
        `${ctx.locale('commands:top.use')} **${res.array[i].count}** ${ctx.locale(
          'commands:top.times',
        )}`,
        false,
      );
    }
    return ctx.sendC(ctx.message.author.toString(), embed);
  }
}
