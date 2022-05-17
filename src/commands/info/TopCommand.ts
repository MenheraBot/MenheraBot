/* eslint-disable no-await-in-loop */
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, ColorResolvable, LimitedCollection, User } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { capitalize, debugError } from '@utils/Util';
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
      description: "「💹」・See Menhera's top users",
      descriptionLocalizations: { 'pt-BR': '「💹」・Veja o top de usuários da Menhera' },
      category: 'util',
      options: [
        {
          name: 'hunting',
          nameLocalizations: { 'pt-BR': 'caças' },
          type: 'SUB_COMMAND',
          description: "「🎯」・See Menhera's current top hunters",
          descriptionLocalizations: { 'pt-BR': '「🎯」・Veja o top caçadores atuais da Menhera' },
          options: [
            {
              type: 'STRING',
              name: 'hunt',
              nameLocalizations: { 'pt-BR': 'caça' },
              description: 'The kind of hunt you want to see',
              descriptionLocalizations: { 'pt-BR': 'O tipo da caça que você quer ver' },
              required: true,
              choices: [
                {
                  name: '😈 | Demons',
                  nameLocalizations: { 'pt-BR': '😈 | Demônios' },
                  value: 'demons',
                },
                {
                  name: '👊 | Giants',
                  nameLocalizations: { 'pt-BR': '👊 | Gigantes' },
                  value: 'giants',
                },
                {
                  name: '👼 | Angels',
                  nameLocalizations: { 'pt-BR': '👼 | Anjos' },
                  value: 'angels',
                },
                {
                  name: '🧚‍♂️ | Archangels',
                  nameLocalizations: { 'pt-BR': '🧚‍♂️ | Arcanjos' },
                  value: 'archangels',
                },
                {
                  name: '🙌 | Demigods',
                  nameLocalizations: { 'pt-BR': '🙌 | Semideuses' },
                  value: 'demigods',
                },
                {
                  name: '✝️ | Gods',
                  nameLocalizations: { 'pt-BR': '✝️ | Deuses' },
                  value: 'gods',
                },
              ],
            },
            {
              type: 'INTEGER',
              name: 'page',
              nameLocalizations: { 'pt-BR': 'página' },
              description: 'Top page you want to see',
              descriptionLocalizations: { 'pt-BR': 'Página do top que tu quer ver' },
              required: false,
              minValue: 2,
              maxValue: 100,
            },
          ],
        },
        {
          name: 'economy',
          nameLocalizations: { 'pt-BR': 'economia' },
          type: 'SUB_COMMAND',
          description: "「⭐」・See Menhera's best users",
          descriptionLocalizations: { 'pt-BR': '「⭐」・Veja os melhores usuários da Menhera' },
          options: [
            {
              type: 'STRING',
              name: 'type',
              nameLocalizations: { 'pt-BR': 'tipo' },
              description: 'The type of top you want to see',
              descriptionLocalizations: { 'pt-BR': 'O tipo de top que tu queres ver' },
              required: true,
              choices: [
                {
                  name: '💋 | Lickers',
                  nameLocalizations: { 'pt-BR': '💋 | Mamadores' },
                  value: 'mamou',
                },
                {
                  name: '👅 | Licked',
                  nameLocalizations: { 'pt-BR': '👅 | Mamados' },
                  value: 'mamado',
                },
                {
                  name: '⭐ | Stars',
                  nameLocalizations: { 'pt-BR': '⭐ | Estrelinhas' },
                  value: 'estrelinhas',
                },
                {
                  name: '🆙 | Votes',
                  nameLocalizations: { 'pt-BR': '🆙 | Votos' },
                  value: 'votes',
                },
              ],
            },
            {
              type: 'INTEGER',
              name: 'page',
              nameLocalizations: { 'pt-BR': 'página' },
              description: 'Top page you want to see',
              descriptionLocalizations: { 'pt-BR': 'Página do top que tu quer ver' },
              required: false,
              minValue: 2,
              maxValue: 100,
            },
          ],
        },
        {
          type: 'SUB_COMMAND',
          name: 'commands',
          nameLocalizations: { 'pt-BR': 'comandos' },
          description: '「📟」・See the best about commands',
          descriptionLocalizations: { 'pt-BR': '「📟」・Veja os melhores sobre os comandos' },
          options: [
            {
              type: 'STRING',
              name: 'type',
              nameLocalizations: { 'pt-BR': 'tipo' },
              description: 'The type of information you want to see',
              descriptionLocalizations: { 'pt-BR': 'O tipo de informação que queres ver' },
              required: true,
              choices: [
                {
                  name: 'Most Used Commands',
                  nameLocalizations: { 'pt-BR': 'Comandos Mais Usados' },
                  value: 'commands',
                },
                {
                  name: 'Users Who Used Commands Most',
                  nameLocalizations: { 'pt-BR': 'Usuários Que Mais Usaram Comandos' },
                  value: 'users',
                },
                {
                  name: 'Most Used Commands by A User',
                  nameLocalizations: { 'pt-BR': 'Comandos Mais Usados De Um Usuário' },
                  value: 'user',
                },
              ],
            },
            {
              type: 'USER',
              name: 'user',
              description: 'User to see most used commands',
              descriptionLocalizations: { 'pt-BR': 'Usuário para ver os comandos mais usados' },
              required: false,
            },
          ],
        },
        {
          type: 'SUB_COMMAND_GROUP',
          name: 'statistics',
          nameLocalizations: { 'pt-BR': 'estatísticas' },
          description: '「📊」・See the best in terms of stats',
          descriptionLocalizations: {
            'pt-BR': '「📊」・Veja os melhores em termos de estatísticas',
          },
          options: [
            {
              name: 'bets',
              nameLocalizations: { 'pt-BR': 'apostas' },
              description: '「📊」・See the best bettors',
              descriptionLocalizations: { 'pt-BR': '「📊」・Veja os melhores apostadores' },
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'game',
                  nameLocalizations: { 'pt-BR': 'jogo' },
                  description: 'Betting game you want to see',
                  descriptionLocalizations: { 'pt-BR': 'Jogo de apostas que você quer ver' },
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
                      name: '🎡 | Roulette',
                      nameLocalizations: { 'pt-BR': '🎡 | Roleta' },
                      value: 'roulette',
                    },
                    {
                      name: '🦌 | Animal Game',
                      nameLocalizations: { 'pt-BR': '🦌 | Jogo do Bicho' },
                      value: 'bicho',
                    },
                  ],
                  required: true,
                },
                {
                  type: 'STRING',
                  name: 'order',
                  nameLocalizations: { 'pt-BR': 'ordenar' },
                  description: 'How you want to sort the Top',
                  descriptionLocalizations: { 'pt-BR': 'Modo que você quer ordenar o Top' },
                  choices: [
                    {
                      name: '⭐ | Start Earned',
                      nameLocalizations: { 'pt-BR': '⭐ | Estrelinhas Ganhas' },
                      value: 'money',
                    },
                    {
                      name: '👑 | Most Wins',
                      nameLocalizations: { 'pt-BR': '👑 | Mais Vitórias' },
                      value: 'wins',
                    },
                  ],
                  required: true,
                },
                {
                  type: 'INTEGER',
                  name: 'page',
                  nameLocalizations: { 'pt-BR': 'página' },
                  description: 'Top page you want to see',
                  descriptionLocalizations: { 'pt-BR': 'Página do top que tu quer ver' },
                  required: false,
                  minValue: 2,
                  maxValue: 100,
                },
              ],
            },
            {
              name: 'hunt',
              nameLocalizations: { 'pt-BR': 'caçar' },
              description: '「🎯」・See the best hunters of all time',
              descriptionLocalizations: {
                'pt-BR': '「🎯」・Veja os melhores caçadores de todos os tempos',
              },
              type: 'SUB_COMMAND',
              options: [
                {
                  type: 'STRING',
                  name: 'hunt',
                  nameLocalizations: { 'pt-BR': 'caça' },
                  description: 'The kind of hunt you want to see',
                  descriptionLocalizations: { 'pt-BR': 'O tipo da caça que você quer ver' },
                  required: true,
                  choices: [
                    {
                      name: '😈 | Demons',
                      nameLocalizations: { 'pt-BR': '😈 | Demônios' },
                      value: 'demons',
                    },
                    {
                      name: '👊 | Giants',
                      nameLocalizations: { 'pt-BR': '👊 | Gigantes' },
                      value: 'giants',
                    },
                    {
                      name: '👼 | Angels',
                      nameLocalizations: { 'pt-BR': '👼 | Anjos' },
                      value: 'angels',
                    },
                    {
                      name: '🧚‍♂️ | Archangels',
                      nameLocalizations: { 'pt-BR': '🧚‍♂️ | Arcanjos' },
                      value: 'archangels',
                    },
                    {
                      name: '🙌 | Demigods',
                      nameLocalizations: { 'pt-BR': '🙌 | Semideuses' },
                      value: 'demigods',
                    },
                    {
                      name: '✝️ | Gods',
                      nameLocalizations: { 'pt-BR': '✝️ | Deuses' },
                      value: 'gods',
                    },
                  ],
                },
                {
                  type: 'STRING',
                  name: 'order',
                  nameLocalizations: { 'pt-BR': 'ordenar' },
                  description: 'How do you want to see the top',
                  descriptionLocalizations: { 'pt-BR': 'Modo que você quer ver o top' },
                  choices: [
                    {
                      name: '👑 | Successful Hunts',
                      nameLocalizations: { 'pt-BR': '👑 | Caças bem-sucedidas' },
                      value: 'success',
                    },
                    {
                      name: '🏅 | Times Hunted',
                      nameLocalizations: { 'pt-BR': '🏅 | Vezes que caçou' },
                      value: 'tries',
                    },
                    {
                      name: '🍀 | Number of Hunts',
                      nameLocalizations: { 'pt-BR': '🍀 | Quantidade de Caças' },
                      value: 'hunted',
                    },
                  ],
                  required: true,
                },
                {
                  type: 'INTEGER',
                  name: 'page',
                  nameLocalizations: { 'pt-BR': 'página' },
                  description: 'Top page you want to see',
                  descriptionLocalizations: { 'pt-BR': 'Página do top que tu quer ver' },
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
      case 'hunting':
      case 'economy': {
        const type = ctx.options.getString(
          command === 'hunting' ? 'hunt' : 'type',
          true,
        ) as keyof IUserSchema;
        const page = ctx.options.getInteger('page') ?? 0;

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
      case 'commands': {
        const type = ctx.options.getString('type', true) as 'commands' | 'users' | 'user';

        if (type === 'commands') return TopCommand.topCommands(ctx);
        if (type === 'users') return TopCommand.topUsers(ctx);
        return TopCommand.topUser(ctx);
      }

      case 'hunt':
        return TopCommand.topStatisticsHunt(ctx);

      case 'bets': {
        const gameMode = ctx.options.getString('game', true);

        if (gameMode === 'roulette' || gameMode === 'bicho')
          return TopCommand.topUserResponseBasedBets(ctx);

        return TopCommand.topAccountResponseBets(ctx);
      }
    }
  }

  static async topAccountResponseBets(ctx: InteractionCommandContext): Promise<void> {
    const gameMode = ctx.options.getString('game', true) as 'blackjack' | 'coinflip';
    const topMode = ctx.options.getString('order', true) as 'money';
    const page = ctx.options.getInteger('page') ?? 0;
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
        if (member.username.startsWith('Deleted User'))
          ctx.client.repositories.cacheRepository.addDeletedAccount([member.id]);
      }

      const userData = result[i];

      const baseField = (gameMode === 'blackjack' ? 'bj' : 'cf') as 'cf';

      embed.addField(
        `**${skip + i + 1} -** ${capitalize(member?.username ?? '404')}`,
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
    const gameMode = ctx.options.getString('game', true) as 'bicho' | 'roulette';
    const topMode = ctx.options.getString('order', true) as 'money';
    const page = ctx.options.getInteger('page') ?? 0;
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
        if (member.username.startsWith('Deleted User'))
          ctx.client.repositories.cacheRepository.addDeletedAccount([member.id]);
      }

      const userData = result[i];

      embed.addField(
        `**${skip + i + 1} -** ${capitalize(member?.username ?? '404')}`,
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
    const huntType = ctx.options.getString('hunt', true) as HuntTypes;
    const topMode = ctx.options.getString('order', true) as 'success';
    const page = ctx.options.getInteger('page') ?? 0;
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
        if (member.username.startsWith('Deleted User'))
          ctx.client.repositories.cacheRepository.addDeletedAccount([member.id]);
      }

      const userData = result[i];

      embed.addField(
        `**${skip + i + 1} -** ${capitalize(member?.username ?? '404')}`,
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
        `**${i + 1} -** ${capitalize(res[i].name)} `,
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
        if (member.username.startsWith('Deleted User'))
          ctx.client.repositories.cacheRepository.addDeletedAccount([res[i].id]);
      }

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
        if (member.username.startsWith('Deleted User'))
          ctx.client.repositories.cacheRepository.addDeletedAccount([res[i].id]);
      }

      embed.addField(
        `**${i + 1} -** ${capitalize(member?.username ?? '404')} `,
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
        `**${i + 1} -** ${capitalize(res.array[i].name)} `,
        `${ctx.locale('commands:top.use')} **${res.array[i].count}** ${ctx.locale(
          'commands:top.times',
        )}`,
        false,
      );
    }
    ctx.defer({ embeds: [embed] });
  }
}
