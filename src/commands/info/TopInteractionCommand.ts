/* eslint-disable no-await-in-loop */
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, ColorResolvable } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import Util from '@utils/Util';
import { COLORS, emojis } from '@structures/MenheraConstants';
import { TopRankingTypes as TOP } from '@utils/Types';

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
              name: '👊 | Gigantes',
              value: 'gigantes',
            },
            {
              name: '👼 | Anjos',
              value: 'anjos',
            },
            {
              name: '🧚‍♂️ | Arcanjos',
              value: 'arcanjos',
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

  static calculateSkipCount(page: number, documents: number): number {
    if (!Number.isNaN(page) && page > 0 && page < documents / 10) return (page - 1) * 10;
    return 0;
  }

  static async topCommands(ctx: InteractionCommandContext): Promise<void> {
    const res = await HttpRequests.getTopCommands();
    if (!res) {
      ctx.editReply({ content: `${emojis.error} | ${ctx.locale('commands:http-error')}` });
      return;
    }
    const embed = new MessageEmbed()

      .setTitle(`:robot: |  ${ctx.translate('commands')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      embed.addField(
        `**${i + 1} -** ${Util.captalize(res[i].name)} `,
        `${ctx.translate('used')} **${res[i].usages}** ${ctx.translate('times')}`,
        false,
      );
    }
    ctx.editReply({ embeds: [embed] });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getString('tipo', true);
    const page = ctx.options.getInteger('pagina') ?? 1;

    await ctx.defer();

    switch (type) {
      case 'mamadores':
        this.executeUserDataRelatedRanking(
          ctx,
          TOP.mamou,
          emojis.crown,
          ctx.translate('mamadoresTitle'),
          ctx.translate('suck'),
          page,
          COLORS.Pinkie,
        );
        return;
      case 'mamados':
        this.executeUserDataRelatedRanking(
          ctx,
          TOP.mamadas,
          emojis.lick,
          ctx.translate('mamouTitle'),
          ctx.translate('suckled'),
          page,
          COLORS.Pinkie,
        );
        return;
      case 'estrelinhas':
        this.executeUserDataRelatedRanking(
          ctx,
          TOP.stars,
          emojis.star,
          ctx.translate('startsTitle'),
          ctx.translate('stars'),
          page,
          COLORS.Pear,
        );
        return;
      case 'demonios':
        this.executeUserDataRelatedRanking(
          ctx,
          TOP.demons,
          emojis.demon,
          ctx.translate('demonTitle'),
          ctx.translate('demons'),
          page,
          COLORS.HuntDemon,
        );
        return;
      case 'gigantes':
        this.executeUserDataRelatedRanking(
          ctx,
          TOP.giants,
          emojis.giant,
          ctx.translate('giantTitle'),
          ctx.translate('giants'),
          page,
          COLORS.HuntGiant,
        );
        return;
      case 'anjos':
        this.executeUserDataRelatedRanking(
          ctx,
          TOP.angels,
          emojis.angel,
          ctx.translate('angelTitle'),
          ctx.translate('angels'),
          page,
          COLORS.HuntAngel,
        );
        return;
      case 'arcanjos':
        this.executeUserDataRelatedRanking(
          ctx,
          TOP.archangels,
          emojis.archangel,
          ctx.translate('archangelTitle'),
          ctx.translate('archangels'),
          page,
          COLORS.HuntArchangel,
        );
        return;
      case 'semideuses':
        this.executeUserDataRelatedRanking(
          ctx,
          TOP.demigods,
          emojis.semigod,
          ctx.translate('sdTitle'),
          ctx.translate('demigods'),
          page,
          COLORS.HuntSD,
        );
        return;
      case 'deuses':
        this.executeUserDataRelatedRanking(
          ctx,
          TOP.gods,
          emojis.god,
          ctx.translate('godTitle'),
          ctx.translate('gods'),
          page,
          COLORS.HuntGod,
        );
        return;
      case 'votos':
        this.executeUserDataRelatedRanking(
          ctx,
          TOP.votes,
          emojis.ok,
          ctx.translate('voteTitle'),
          ctx.translate('votes'),
          page,
          COLORS.UltraPink,
        );
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

  async executeUserDataRelatedRanking(
    ctx: InteractionCommandContext,
    labelType: TOP,
    emoji: string,
    embedTitle: string,
    actor: string,
    page: number,
    color: ColorResolvable,
  ): Promise<void> {
    const skip = TopInteractionCommand.calculateSkipCount(page, 1000);

    const res = await this.client.repositories.userRepository.getTopRanking(
      labelType,
      skip,
      await this.client.repositories.cacheRepository.getDeletedAccounts(),
    );

    const embed = new MessageEmbed()
      .setTitle(`${emoji} | ${embedTitle} ${page > 1 ? page : 1}º`)
      .setColor(color);

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch(() => null);
      const memberName = member?.username ?? res[i].id;

      if (memberName.startsWith('Deleted User'))
        this.client.repositories.cacheRepository.addDeletedAccount(res[i].id);

      embed.addField(`**${skip + 1 + i} -** ${memberName}`, `${actor}: **${res[i].value}**`, false);
    }

    ctx.defer({ embeds: [embed] });
  }

  async topUsers(ctx: InteractionCommandContext): Promise<void> {
    const res = await HttpRequests.getTopUsers();
    if (!res) {
      ctx.defer({ content: `${emojis.error} |  ${ctx.locale('commands:http-error')}` });
      return;
    }
    const embed = new MessageEmbed()

      .setTitle(`<:MenheraSmile2:767210250364780554> |  ${ctx.translate('users')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      const member = await this.client.users.fetch(res[i].id).catch();
      embed.addField(
        `**${i + 1} -** ${Util.captalize(member.username)} `,
        `${ctx.translate('use')} **${res[i].uses}** ${ctx.translate('times')}`,
        false,
      );
    }
    ctx.defer({ embeds: [embed] });
  }

  static async topUser(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    if (!user) {
      ctx.defer({ content: `${emojis.error} | ${ctx.translate('not-user')}` });
      return;
    }

    const res = await HttpRequests.getProfileCommands(user.id);
    const embed = new MessageEmbed()

      .setTitle(
        `<:MenheraSmile2:767210250364780554> |  ${ctx.translate('user', {
          user: user.username,
        })}`,
      )
      .setColor('#f47fff');

    if (!res || res.cmds.count === 0) {
      ctx.defer({ content: `${emojis.error} | ${ctx.translate('not-user')}` });
      return;
    }

    for (let i = 0; i < res.array.length; i++) {
      if (i > 10) break;
      embed.addField(
        `**${i + 1} -** ${Util.captalize(res.array[i].name)} `,
        `${ctx.translate('use')} **${res.array[i].count}** ${ctx.translate('times')}`,
        false,
      );
    }
    ctx.defer({ embeds: [embed] });
  }
}
