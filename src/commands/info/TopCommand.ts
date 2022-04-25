/* eslint-disable no-await-in-loop */
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, ColorResolvable, LimitedCollection, User } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import Util, { debugError } from '@utils/Util';
import { COLORS, emojis } from '@structures/Constants';
import { TopRankingTypes as TOP } from '@custom_types/Menhera';

export default class TopCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'top',
      description: '「💹」・Veja o top de usuários da Menhera',
      category: 'util',
      options: [
        {
          name: 'cacas',
          type: 'SUB_COMMAND',
          description: '「🎯」・Veja o top caçadores atuais da Menhera',
          options: [
            {
              type: 'STRING',
              name: 'caca',
              description: 'O tipo da caça que você quer ver',
              required: true,
              choices: [
                {
                  name: '😈 | Demônios',
                  value: 'demons',
                },
                {
                  name: '👊 | Gigantes',
                  value: 'giants',
                },
                {
                  name: '👼 | Anjos',
                  value: 'angels',
                },
                {
                  name: '🧚‍♂️ | Arcanjos',
                  value: 'archangels',
                },
                {
                  name: '🙌 | Semideuses',
                  value: 'demigods',
                },
                {
                  name: '✝️ | Deuses',
                  value: 'gods',
                },
              ],
            },
            {
              type: 'INTEGER',
              name: 'pagina',
              description: 'Página do top que tu quer ver',
              required: false,
              minValue: 2,
              maxValue: 100,
            },
          ],
        },
        {
          name: 'economia',
          type: 'SUB_COMMAND',
          description: '「⭐」・Veja os melhores usuários da Menhera',
          options: [
            {
              type: 'STRING',
              name: 'caca',
              description: 'O tipo da caça que você quer ver',
              required: true,
              choices: [
                {
                  name: '💋 | Mamadores',
                  value: 'mamou',
                },
                {
                  name: '👅 | Mamados',
                  value: 'mamado',
                },
                {
                  name: '⭐ | Estrelinhas',
                  value: 'estrelinhas',
                },

                {
                  name: '🆙 | Votos',
                  value: 'votes',
                },
              ],
            },
            {
              type: 'INTEGER',
              name: 'pagina',
              description: 'Página do top que tu quer ver',
              required: false,
              minValue: 2,
              maxValue: 100,
            },
          ],
        },
        {
          type: 'SUB_COMMAND',
          name: 'comandos',
          description: '「📟」・Veja os melhores sobre os comandos',
          options: [
            {
              type: 'STRING',
              name: 'tipo',
              description: 'O tipo de informação que queres ver',
              required: true,
              choices: [
                {
                  name: 'Comandos mais usados',
                  value: 'commands',
                },
                {
                  name: 'Usuários que mais usaram comandos',
                  value: 'users',
                },
                {
                  name: 'Comandos mais usados de um usuário',
                  value: 'user',
                },
              ],
            },
            {
              type: 'USER',
              name: 'user',
              description: 'Usuário para ver os comandos mais usados',
              required: false,
            },
          ],
        },
        {
          type: 'SUB_COMMAND_GROUP',
          name: 'estatisticas',
          description: '「📊」・Veja os melhores em termos de estatísticas',
          options: [
            {
              name: 'apostas',
              description: '「📊」・Veja os melhores apostadores',
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'jogo',
                  description: 'Jogo de apostas que você quer ver',
                  type: 'STRING',
                  choices: [
                    {
                      name: '🃏 | Blackjack',
                      value: 'blackjack',
                    },
                    {
                      name: '📀 | Coinflip',
                      value: 'coinflip',
                    },
                    {
                      name: '🎡 | Roleta',
                      value: 'roulette',
                    },
                    {
                      name: '🦌 | Jogo do Bicho',
                      value: 'bicho',
                    },
                  ],
                  required: true,
                },
                {
                  type: 'STRING',
                  name: 'modo',
                  description: 'Modo que você quer ver o top',
                  choices: [
                    { name: '⭐ | Lucro Total', value: 'money' },
                    { name: '👑 | Mais Vitórias', value: 'wins' },
                  ],
                  required: true,
                },
                {
                  type: 'INTEGER',
                  name: 'pagina',
                  description: 'Página do top que tu quer ver',
                  required: false,
                  minValue: 2,
                  maxValue: 100,
                },
              ],
            },
            {
              name: 'cacar',
              description: '「🎯」・Veja os melhores caçadores de todos os tempos',
              type: 'SUB_COMMAND',
              options: [
                {
                  type: 'STRING',
                  name: 'caca',
                  description: 'O tipo da caça que você quer ver',
                  required: true,
                  choices: [
                    {
                      name: '😈 | Demônios',
                      value: 'demon',
                    },
                    {
                      name: '👊 | Gigantes',
                      value: 'giant',
                    },
                    {
                      name: '👼 | Anjos',
                      value: 'angel',
                    },
                    {
                      name: '🧚‍♂️ | Arcanjos',
                      value: 'archangel',
                    },
                    {
                      name: '🙌 | Semideuses',
                      value: 'demigod',
                    },
                    {
                      name: '✝️ | Deuses',
                      value: 'god',
                    },
                  ],
                },
                {
                  type: 'STRING',
                  name: 'modo',
                  description: 'Modo que você quer ver o top',
                  choices: [
                    { name: '👑 | Caças bem-sucedidas', value: 'success' },
                    { name: '🏅 | Vezes que caçou', value: 'tries' },
                    { name: '🍀 | Quantidade de caças', value: 'hunted' },
                  ],
                  required: true,
                },
                {
                  type: 'INTEGER',
                  name: 'pagina',
                  description: 'Página do top que tu quer ver',
                  required: false,
                  minValue: 2,
                  maxValue: 100,
                },
              ],
            },
          ],
        },
      ],
      cooldown: 5,
    });
  }

  static calculateSkipCount(page: number, documents: number): number {
    if (!Number.isNaN(page) && page > 0) {
      if (page >= documents / 10) return documents / 10;
      return (page - 1) * 10;
    }
    return 0;
  }

  static async topCommands(ctx: InteractionCommandContext): Promise<void> {
    const res = await HttpRequests.getTopCommands();
    if (!res) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });
      return;
    }
    const embed = new MessageEmbed()

      .setTitle(`:robot: |  ${ctx.locale('commands:top.commands')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      embed.addField(
        `**${i + 1} -** ${Util.capitalize(res[i].name)} `,
        `${ctx.locale('commands:top.used')} **${res[i].usages}** ${ctx.locale(
          'commands:top.times',
        )}`,
        false,
      );
    }
    ctx.makeMessage({ embeds: [embed] });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getString('tipo', true);
    const page = ctx.options.getInteger('pagina') ?? 1;

    await ctx.defer();

    switch (type) {
      case 'mamadores':
        TopCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.mamou,
          emojis.crown,
          ctx.locale('commands:top.mamadoresTitle'),
          ctx.locale('commands:top.suck'),
          page,
          COLORS.Pinkie,
        );
        return;
      case 'mamados':
        TopCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.mamadas,
          emojis.lick,
          ctx.locale('commands:top.mamouTitle'),
          ctx.locale('commands:top.suckled'),
          page,
          COLORS.Pinkie,
        );
        return;
      case 'estrelinhas':
        TopCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.stars,
          emojis.estrelinhas,
          ctx.locale('commands:top.starsTitle'),
          ctx.locale('commands:top.stars'),
          page,
          COLORS.Pear,
        );
        return;
      case 'demonios':
        TopCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.demons,
          emojis.demons,
          ctx.locale('commands:top.demonTitle'),
          ctx.locale('commands:top.demons'),
          page,
          COLORS.HuntDemons,
        );
        return;
      case 'gigantes':
        TopCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.giants,
          emojis.giants,
          ctx.locale('commands:top.giantTitle'),
          ctx.locale('commands:top.giants'),
          page,
          COLORS.HuntGiants,
        );
        return;
      case 'anjos':
        TopCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.angels,
          emojis.angels,
          ctx.locale('commands:top.angelTitle'),
          ctx.locale('commands:top.angels'),
          page,
          COLORS.HuntAngels,
        );
        return;
      case 'arcanjos':
        TopCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.archangels,
          emojis.archangels,
          ctx.locale('commands:top.archangelTitle'),
          ctx.locale('commands:top.archangels'),
          page,
          COLORS.HuntArchangels,
        );
        return;
      case 'semideuses':
        TopCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.demigods,
          emojis.demigods,
          ctx.locale('commands:top.sdTitle'),
          ctx.locale('commands:top.demigods'),
          page,
          COLORS.HuntDemigods,
        );
        return;
      case 'deuses':
        TopCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.gods,
          emojis.gods,
          ctx.locale('commands:top.godTitle'),
          ctx.locale('commands:top.gods'),
          page,
          COLORS.HuntGods,
        );
        return;
      case 'votos':
        TopCommand.executeUserDataRelatedRanking(
          ctx,
          TOP.votes,
          emojis.ok,
          ctx.locale('commands:top.voteTitle'),
          ctx.locale('commands:top.votes'),
          page,
          COLORS.UltraPink,
        );
        return;
      case 'comandos':
        TopCommand.topCommands(ctx);
        return;
      case 'users':
        TopCommand.topUsers(ctx);
        return;
      case 'user':
        TopCommand.topUser(ctx);
    }
  }

  static async executeUserDataRelatedRanking(
    ctx: InteractionCommandContext,
    labelType: TOP,
    emoji: string,
    embedTitle: string,
    actor: string,
    page: number,
    color: ColorResolvable,
  ): Promise<void> {
    const skip = TopCommand.calculateSkipCount(page, 1000);

    const res = await ctx.client.repositories.userRepository.getTopRanking(
      labelType,
      skip,
      await ctx.client.repositories.cacheRepository.getDeletedAccounts(),
    );

    const embed = new MessageEmbed()
      .setTitle(`${emoji} | ${embedTitle} ${page > 1 ? page : 1}º`)
      .setColor(color);

    for (let i = 0; i < res.length; i++) {
      const member = await ctx.client.users.fetch(res[i].id).catch(debugError);
      const memberName = member?.username ?? res[i].id;

      if (member)
        (ctx.client.users.cache as LimitedCollection<string, User>).forceSet(member.id, member);

      if (memberName.startsWith('Deleted User'))
        ctx.client.repositories.cacheRepository.addDeletedAccount(res[i].id);

      embed.addField(`**${skip + 1 + i} -** ${memberName}`, `${actor}: **${res[i].value}**`, false);
    }

    ctx.defer({ embeds: [embed] });
  }

  static async topUsers(ctx: InteractionCommandContext): Promise<void> {
    const res = await HttpRequests.getTopUsers();

    if (!res) {
      ctx.defer({ content: `${emojis.error} |  ${ctx.locale('common:http-error')}` });
      return;
    }

    const embed = new MessageEmbed()

      .setTitle(`<:MenheraSmile2:767210250364780554> |  ${ctx.locale('commands:top.users')}`)
      .setColor('#f47fff');

    for (let i = 0; i < res.length; i++) {
      const member = await ctx.client.users.fetch(res[i].id).catch(debugError);

      if (member)
        (ctx.client.users.cache as LimitedCollection<string, User>).forceSet(member.id, member);

      embed.addField(
        `**${i + 1} -** ${Util.capitalize(member?.username ?? '404')} `,
        `${ctx.locale('commands:top.use')} **${res[i].uses}** ${ctx.locale('commands:top.times')}`,
        false,
      );
    }
    ctx.defer({ embeds: [embed] });
  }

  static async topUser(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.author;

    if (!user) {
      ctx.defer({ content: `${emojis.error} | ${ctx.locale('commands:top.not-user')}` });
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
      ctx.defer({ content: `${emojis.error} | ${ctx.locale('commands:top.not-user')}` });
      return;
    }

    for (let i = 0; i < res.array.length; i++) {
      if (i > 10) break;
      embed.addField(
        `**${i + 1} -** ${Util.capitalize(res.array[i].name)} `,
        `${ctx.locale('commands:top.use')} **${res.array[i].count}** ${ctx.locale(
          'commands:top.times',
        )}`,
        false,
      );
    }
    ctx.defer({ embeds: [embed] });
  }
}
