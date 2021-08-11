/* eslint-disable no-await-in-loop */
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';
import Util from '@utils/Util';
import { emojis } from '@structures/MenheraConstants';

export default class TopInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'top',
      description: '「💹」・Veja o top de usuários da Menhera',
      category: 'util',
      options: [
        {
          type: 'STRING',
          name: 'tipo',
          description: 'Tipo do top que você quer ver',
          required: true,
          choices: [
            {
              name: '💋 | Mamadores',
              value: 'mamadores',
            },
            {
              name: '👅 | Mamados',
              value: 'mamados',
            },
            {
              name: '⭐ | Estrelinhas',
              value: 'estrelinhas',
            },
            {
              name: '😈 | Demônios',
              value: 'demonios',
            },
            {
              name: '👼 | Anjos',
              value: 'anjos',
            },
            {
              name: '🙌 | Semideuses',
              value: 'semideuses',
            },
            {
              name: '✝️ | Deuses',
              value: 'deuses',
            },
            {
              name: '🆙 | Votos',
              value: 'votos',
            },
            {
              name: '📟 | Comandos',
              value: 'comandos',
            },
            {
              name: '👥 | Usuários',
              value: 'users',
            },
            {
              name: '👤 | Usuário',
              value: 'user',
            },
          ],
        },
        {
          type: 'INTEGER',
          name: 'pagina',
          description: 'Página do top que tu quer ver',
          required: false,
        },
        {
          type: 'USER',
          name: 'user',
          description: 'Caso queira ver o top users, diga qual vai ser o usuário',
          required: false,
        },
      ],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  static async topCommands(ctx: InteractionCommandContext): Promise<void> {
    const res = await HttpRequests.getTopCommands();
    if (!res) {
      ctx.editReply({ content: `${emojis.error} | ${ctx.locale('commands:http-error')}` });
      return;
    }
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
    ctx.editReply({ embeds: [embed] });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getString('tipo', true);
    const pagina = ctx.options.getInteger('pagina') ?? 1;

    await ctx.interaction.deferReply();

    switch (type) {
      case 'mamadores':
        this.topMamadores(ctx, pagina);
        return;
      case 'mamados':
        this.topMamados(ctx, pagina);
        return;
      case 'estrelinhas':
        this.topEstrelinhas(ctx, pagina);
        return;
      case 'demonios':
        this.topDemonios(ctx, pagina);
        return;
      case 'anjos':
        this.topAnjos(ctx, pagina);
        return;
      case 'semideuses':
        this.topSD(ctx, pagina);
        return;
      case 'deuses':
        this.topDeuses(ctx, pagina);
        return;
      case 'votos':
        this.topVotos(ctx, pagina);
        return;
      case 'comandos':
        TopInteractionCommand.topCommands(ctx);
        return;
      case 'users':
        this.topUsers(ctx);
        return;
      case 'user':
        TopInteractionCommand.topUser(ctx);
    }
  }

  async topMamados(ctx: InteractionCommandContext, pagina: number): Promise<void> {
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
      const member = await this.client.users.fetch(res[i].id).catch();
      const memberName = member?.username ?? res[i].id;

      embed.addField(
        `**${skip + 1 + i} -** ${memberName}`,
        `${ctx.locale('commands:top.suckled')}: **${res[i].mamadas}**`,
        false,
      );
    }
    ctx.editReply({ embeds: [embed] });
  }

  async topMamadores(ctx: InteractionCommandContext, pagina: number): Promise<void> {
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
    ctx.editReply({ embeds: [embed] });
  }

  async topDemonios(ctx: InteractionCommandContext, pagina: number): Promise<void> {
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
    ctx.editReply({ embeds: [embed] });
  }

  async topAnjos(ctx: InteractionCommandContext, pagina: number): Promise<void> {
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
    ctx.editReply({ embeds: [embed] });
  }

  async topSD(ctx: InteractionCommandContext, pagina: number): Promise<void> {
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
    ctx.editReply({ embeds: [embed] });
  }

  async topDeuses(ctx: InteractionCommandContext, pagina: number): Promise<void> {
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
    ctx.editReply({ embeds: [embed] });
  }

  async topEstrelinhas(ctx: InteractionCommandContext, pagina: number): Promise<void> {
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
    ctx.editReply({ embeds: [embed] });
  }

  async topVotos(ctx: InteractionCommandContext, pagina: number): Promise<void> {
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
    ctx.editReply({ embeds: [embed] });
  }

  async topUsers(ctx: InteractionCommandContext): Promise<void> {
    const res = await HttpRequests.getTopUsers();
    if (!res) {
      ctx.editReply({ content: `${emojis.error} |  ${ctx.locale('commands:http-error')}` });
      return;
    }
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
    ctx.editReply({ embeds: [embed] });
  }

  static async topUser(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.interaction.user;

    if (!user) {
      ctx.editReply({ content: `${emojis.error} | ${ctx.locale('commands:top.not-user')}` });
      return;
    }

    const res = await HttpRequests.getProfileCommands(user.id);
    const embed = new MessageEmbed()

      .setTitle(
        `<:MenheraSmile2:767210250364780554> |  ${ctx.locale('commands:top.user', {
          user: user.username,
        })}`,
      )
      .setColor('#f47fff');

    if (!res || res.cmds.count === 0) {
      ctx.editReply({ content: `${emojis.error} | ${ctx.locale('commands:top.not-user')}` });
      return;
    }

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
    ctx.editReply({ embeds: [embed] });
  }
}
