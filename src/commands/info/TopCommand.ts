/* eslint-disable no-await-in-loop */
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, ColorResolvable, LimitedCollection, User } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import Util, { capitalize, debugError } from '@utils/Util';
import { COLORS, emojis } from '@structures/Constants';
import { CoinflipTop, HuntTypes, IUserSchema } from '@custom_types/Menhera';

const TopEmojis: { [key: string]: string } = {
  mamou: emojis.crown,
  mamado: emojis.lick,
  estrelinhas: emojis.estrelinhas,
  demons: emojis.demons,
  giants: emojis.giants,
  angels: emojis.angels,
  archangels: emojis.archangels,
  demigods: emojis.demigods,
  gods: emojis.gods,
  votes: emojis.ok,
  blackjack: '🃏',
  coinflip: '📀',
  roulette: '🎡',
  bicho: '🦌',
};

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
              name: 'tipo',
              description: 'O tipo de top que tu queres ver',
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
                  name: 'ordenar',
                  description: 'Modo que você quer ordenar o Top',
                  choices: [
                    { name: '⭐ | Estrelinhas Ganhas', value: 'money' },
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
                  name: 'ordenar',
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

  static calculateSkipCount(page: number, documents = 1000): number {
    if (!Number.isNaN(page) && page > 0) {
      if (page >= documents / 10) return documents / 10;
      return (page - 1) * 10;
    }
    return 0;
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand(true);
    ctx.defer();
    ctx.interaction.deferred = true;

    switch (command) {
      case 'cacas':
      case 'economia': {
        const type = ctx.options.getString(
          command === 'cacas' ? 'caca' : 'tipo',
          true,
        ) as keyof IUserSchema;
        const page = ctx.options.getInteger('pagina') ?? 0;

        return TopCommand.executeUserDataRelatedRanking(
          ctx,
          type,
          TopEmojis[type],
          ctx.locale(`commands:top.economia.${type as 'mamou'}-title`),
          ctx.locale(`commands:top.economia.${type as 'mamou'}`),
          page,
          COLORS.Purple,
        );
      }
      case 'comandos': {
        const type = ctx.options.getString('tipo', true) as 'commands' | 'users' | 'user';

        if (type === 'commands') return TopCommand.topCommands(ctx);
        if (type === 'users') return TopCommand.topUsers(ctx);
        return TopCommand.topUser(ctx);
      }

      case 'cacar':
        return TopCommand.topStatisticsHunt(ctx);

      case 'apostas': {
        const gameMode = ctx.options.getString('jogo', true);

        if (gameMode === 'roulette' || gameMode === 'bicho')
          return TopCommand.topUserResponseBasedBets(ctx);

        return TopCommand.topAccountResponseBets(ctx);
      }
    }
  }

  static async topAccountResponseBets(ctx: InteractionCommandContext): Promise<void> {
    const gameMode = ctx.options.getString('jogo', true) as 'blackjack' | 'coinflip';
    const topMode = ctx.options.getString('ordenar', true) as 'money';
    const page = ctx.options.getInteger('pagina') ?? 0;
    const skip = TopCommand.calculateSkipCount(page);

    const bannedUsers = ctx.client.repositories.blacklistRepository.getAllBannedUsersId();
    const deletedAccounts = ctx.client.repositories.cacheRepository.getDeletedAccounts();

    const usersToIgnore = await Promise.all([bannedUsers, deletedAccounts]).then((a) =>
      a[0].concat(a[1]),
    );

    const result = (await HttpRequests[
      `getTop${capitalize(gameMode) as Capitalize<typeof gameMode>}`
    ](skip, usersToIgnore, topMode)) as CoinflipTop[] | null;

    if (!result) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(
        ctx.locale('commands:top.estatisticas.apostas.title', {
          type: ctx.locale(`commands:top.estatisticas.apostas.${gameMode}`),
          page: page > 1 ? page : 1,
          emoji: TopEmojis[gameMode],
        }),
      )
      .setDescription(ctx.locale(`commands:top.estatisticas.apostas.description.${topMode}`))
      .setColor(COLORS.Pinkie);

    for (let i = 0; i < result.length; i++) {
      const member = await ctx.client.users.fetch(result[i].id).catch(debugError);

      if (member) {
        (ctx.client.users.cache as LimitedCollection<string, User>).forceSet(member.id, member);
        if (i === 0) embed.setThumbnail(member.displayAvatarURL({ dynamic: true }));
      }

      const userData = result[i];

      const baseField = (gameMode === 'blackjack' ? 'bj' : 'cf') as 'cf';

      embed.addField(
        `**${skip + i + 1} -** ${Util.capitalize(member?.username ?? '404')}`,
        ctx.locale('commands:top.estatisticas.apostas.description.text', {
          earnMoney: userData[`${baseField}_win_money`].toLocaleString(ctx.interaction.locale),
          lostMoney: userData[`${baseField}_lose_money`].toLocaleString(ctx.interaction.locale),
          lostGames: userData[`${baseField}_loses`],
          wonGames: userData[`${baseField}_wins`],
          winPercentage:
            (
              ((userData[`${baseField}_wins`] ?? 0) /
                (userData[`${baseField}_wins`] + userData[`${baseField}_loses`])) *
              100
            ).toFixed(2) || 0,
          lostPercentage:
            (
              ((userData[`${baseField}_loses`] ?? 0) /
                (userData[`${baseField}_wins`] + userData[`${baseField}_loses`])) *
              100
            ).toFixed(2) || 0,
        }),
        false,
      );
    }

    ctx.makeMessage({ embeds: [embed] });
  }

  static async topUserResponseBasedBets(ctx: InteractionCommandContext): Promise<void> {
    const gameMode = ctx.options.getString('jogo', true) as 'bicho' | 'roulette';
    const topMode = ctx.options.getString('ordenar', true) as 'money';
    const page = ctx.options.getInteger('pagina') ?? 0;
    const skip = TopCommand.calculateSkipCount(page);

    const bannedUsers = ctx.client.repositories.blacklistRepository.getAllBannedUsersId();
    const deletedAccounts = ctx.client.repositories.cacheRepository.getDeletedAccounts();

    const usersToIgnore = await Promise.all([bannedUsers, deletedAccounts]).then((a) =>
      a[0].concat(a[1]),
    );

    const result = await HttpRequests[
      `getTop${capitalize(gameMode) as Capitalize<typeof gameMode>}`
    ](skip, usersToIgnore, topMode);

    if (!result) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(
        ctx.locale('commands:top.estatisticas.apostas.title', {
          type: ctx.locale(`commands:top.estatisticas.apostas.${gameMode}`),
          page: page > 1 ? page : 1,
          emoji: TopEmojis[gameMode],
        }),
      )
      .setDescription(ctx.locale(`commands:top.estatisticas.apostas.description.${topMode}`))
      .setColor(COLORS.Pinkie);

    for (let i = 0; i < result.length; i++) {
      const member = await ctx.client.users.fetch(result[i].user_id).catch(debugError);

      if (member) {
        (ctx.client.users.cache as LimitedCollection<string, User>).forceSet(member.id, member);
        if (i === 0) embed.setThumbnail(member.displayAvatarURL({ dynamic: true }));
      }

      const userData = result[i];
      console.log(userData.user_id);

      embed.addField(
        `**${skip + i + 1} -** ${Util.capitalize(member?.username ?? '404')}`,
        ctx.locale('commands:top.estatisticas.apostas.description.text', {
          earnMoney: userData.earn_money.toLocaleString(ctx.interaction.locale),
          lostMoney: userData.lost_money.toLocaleString(ctx.interaction.locale),
          lostGames: userData.lost_games,
          wonGames: userData.won_games,
          winPercentage:
            (
              ((userData.won_games ?? 0) / (userData.won_games + userData.lost_games)) *
              100
            ).toFixed(2) || 0,
          lostPercentage:
            (
              ((userData.lost_games ?? 0) / (userData.won_games + userData.lost_games)) *
              100
            ).toFixed(2) || 0,
        }),
        false,
      );
    }

    ctx.makeMessage({ embeds: [embed] });
  }

  static async topStatisticsHunt(ctx: InteractionCommandContext): Promise<void> {
    const huntType = ctx.options.getString('caca', true) as HuntTypes;
    const topMode = ctx.options.getString('ordenar', true) as 'success';
    const page = ctx.options.getInteger('pagina') ?? 0;
    const skip = TopCommand.calculateSkipCount(page);

    const bannedUsers = ctx.client.repositories.blacklistRepository.getAllBannedUsersId();
    const deletedAccounts = ctx.client.repositories.cacheRepository.getDeletedAccounts();

    const usersToIgnore = await Promise.all([bannedUsers, deletedAccounts]).then((a) =>
      a[0].concat(a[1]),
    );

    const result = await HttpRequests.getTopHunts(skip, usersToIgnore, huntType, topMode);

    if (!result) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(
        ctx.locale('commands:top.estatisticas.cacar.title', {
          type: ctx.locale(`commands:top.estatisticas.cacar.${huntType}`),
          page: page > 1 ? page : 1,
          emoji: TopEmojis[`${huntType}s`],
        }),
      )
      .setDescription(ctx.locale(`commands:top.estatisticas.cacar.description.${topMode}`))
      .setColor(COLORS.Pinkie);

    for (let i = 0; i < result.length; i++) {
      const member = await ctx.client.users.fetch(result[i].user_id).catch(debugError);

      if (member) {
        (ctx.client.users.cache as LimitedCollection<string, User>).forceSet(member.id, member);
        if (i === 0) embed.setThumbnail(member.displayAvatarURL({ dynamic: true }));
      }

      const userData = result[i];

      embed.addField(
        `**${skip + i + 1} -** ${Util.capitalize(member?.username ?? '404')}`,
        ctx.locale('commands:top.estatisticas.cacar.description.text', {
          hunted: userData[`${huntType}_hunted`],
          success: userData[`${huntType}_success`],
          tries: userData[`${huntType}_tries`],
        }),
        true,
      );
    }

    ctx.makeMessage({ embeds: [embed] });
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

  static async executeUserDataRelatedRanking(
    ctx: InteractionCommandContext,
    labelType: keyof IUserSchema,
    emoji: string,
    embedTitle: string,
    actor: string,
    page: number,
    color: ColorResolvable,
  ): Promise<void> {
    const skip = TopCommand.calculateSkipCount(page);

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

      if (member) {
        (ctx.client.users.cache as LimitedCollection<string, User>).forceSet(member.id, member);
        if (i === 0) embed.setThumbnail(member.displayAvatarURL({ dynamic: true }));
      }

      if (memberName.startsWith('Deleted User'))
        ctx.client.repositories.cacheRepository.addDeletedAccount(res[i].id);

      embed.addField(`**${skip + 1 + i} -** ${memberName}`, `${actor}: **${res[i].value}**`, false);
    }

    ctx.makeMessage({ embeds: [embed] });
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

      if (member) {
        (ctx.client.users.cache as LimitedCollection<string, User>).forceSet(member.id, member);
        if (i === 0) embed.setThumbnail(member.displayAvatarURL({ dynamic: true }));
      }

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
