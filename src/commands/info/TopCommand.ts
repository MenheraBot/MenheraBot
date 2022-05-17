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
      description: '「💹」・Veja o top de usuários da Menhera',
      descriptionLocalizations: { 'en-US': "「💹」・See Menhera's top users" },
      category: 'util',
      options: [
        {
          name: 'cacas',
          nameLocalizations: { 'en-US': 'hunting' },
          type: 'SUB_COMMAND',
          description: '「🎯」・Veja o top caçadores atuais da Menhera',
          descriptionLocalizations: { 'en-US': "「🎯」・See Menhera's current top hunters" },
          options: [
            {
              type: 'STRING',
              name: 'caca',
              nameLocalizations: { 'en-US': 'hunt' },
              description: 'O tipo da caça que você quer ver',
              descriptionLocalizations: { 'en-US': 'The kind of hunt you want to see' },
              required: true,
              choices: [
                {
                  name: '😈 | Demônios',
                  nameLocalizations: { 'en-US': '😈 | Demons' },
                  value: 'demons',
                },
                {
                  name: '👊 | Gigantes',
                  nameLocalizations: { 'en-US': '👊 | Giants' },
                  value: 'giants',
                },
                {
                  name: '👼 | Anjos',
                  nameLocalizations: { 'en-US': '👼 | Angels' },
                  value: 'angels',
                },
                {
                  name: '🧚‍♂️ | Arcanjos',
                  nameLocalizations: { 'en-US': '🧚‍♂️ | Atchangels' },
                  value: 'archangels',
                },
                {
                  name: '🙌 | Semideuses',
                  nameLocalizations: { 'en-US': '🙌 | Demigods' },
                  value: 'demigods',
                },
                {
                  name: '✝️ | Deuses',
                  nameLocalizations: { 'en-US': '✝️ | Gods' },
                  value: 'gods',
                },
              ],
            },
            {
              type: 'INTEGER',
              name: 'pagina',
              nameLocalizations: { 'en-US': 'page' },
              description: 'Página do top que tu quer ver',
              descriptionLocalizations: { 'en-US': 'Top page you want to see' },
              required: false,
              minValue: 2,
              maxValue: 100,
            },
          ],
        },
        {
          name: 'economia',
          nameLocalizations: { 'en-US': 'economy' },
          type: 'SUB_COMMAND',
          description: '「⭐」・Veja os melhores usuários da Menhera',
          descriptionLocalizations: { 'en-US': "「⭐」・See Menhera's best users" },
          options: [
            {
              type: 'STRING',
              name: 'tipo',
              nameLocalizations: { 'en-US': 'type' },
              description: 'O tipo de top que tu queres ver',
              descriptionLocalizations: { 'en-US': 'The type of top you want to see' },
              required: true,
              choices: [
                {
                  name: '💋 | Mamadores',
                  nameLocalizations: { 'en-US': '💋 | Lickers' },
                  value: 'mamou',
                },
                {
                  name: '👅 | Mamados',
                  nameLocalizations: { 'en-US': '👅 | Licked' },
                  value: 'mamado',
                },
                {
                  name: '⭐ | Estrelinhas',
                  nameLocalizations: { 'en-US': '⭐ | Stars' },
                  value: 'estrelinhas',
                },
                {
                  name: '🆙 | Votos',
                  nameLocalizations: { 'en-US': '🆙 | Votes' },
                  value: 'votes',
                },
              ],
            },
            {
              type: 'INTEGER',
              name: 'pagina',
              nameLocalizations: { 'en-US': 'page' },
              description: 'Página do top que tu quer ver',
              descriptionLocalizations: { 'en-US': 'Top page you want to see' },
              required: false,
              minValue: 2,
              maxValue: 100,
            },
          ],
        },
        {
          type: 'SUB_COMMAND',
          name: 'comandos',
          nameLocalizations: { 'en-US': 'commands' },
          description: '「📟」・Veja os melhores sobre os comandos',
          descriptionLocalizations: { 'en-US': '「📟」・See the best about commands' },
          options: [
            {
              type: 'STRING',
              name: 'tipo',
              nameLocalizations: { 'en-US': 'type' },
              description: 'O tipo de informação que queres ver',
              descriptionLocalizations: { 'en-US': 'The type of information you want to see' },
              required: true,
              choices: [
                {
                  name: 'Comandos Mais Usados',
                  nameLocalizations: { 'en-US': 'Most Used Commands' },
                  value: 'commands',
                },
                {
                  name: 'Usuários Que Mais Usaram Comandos',
                  nameLocalizations: { 'en-US': 'Users Who Used Commands Most' },
                  value: 'users',
                },
                {
                  name: 'Comandos Mais Usados De Um Usuário',
                  nameLocalizations: { 'en-US': 'Most Used Commands by A User' },
                  value: 'user',
                },
              ],
            },
            {
              type: 'USER',
              name: 'user',
              description: 'Usuário para ver os comandos mais usados',
              descriptionLocalizations: { 'en-US': 'User to see most used commands' },
              required: false,
            },
          ],
        },
        {
          type: 'SUB_COMMAND_GROUP',
          name: 'estatisticas',
          nameLocalizations: { 'en-US': 'statistics' },
          description: '「📊」・Veja os melhores em termos de estatísticas',
          descriptionLocalizations: { 'en-US': '「📊」・See the best in terms of stats' },
          options: [
            {
              name: 'apostas',
              nameLocalizations: { 'en-US': 'bets' },
              description: '「📊」・Veja os melhores apostadores',
              descriptionLocalizations: { 'en-US': '「📊」・See the best bettors' },
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'jogo',
                  nameLocalizations: { 'en-US': 'game' },
                  description: 'Jogo de apostas que você quer ver',
                  descriptionLocalizations: { 'en-US': 'Betting game you want to see' },
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
                      nameLocalizations: { 'en-US': '🎡 | Roulette' },
                      value: 'roulette',
                    },
                    {
                      name: '🦌 | Jogo do Bicho',
                      nameLocalizations: { 'en-US': '🦌 | Animal Game' },
                      value: 'bicho',
                    },
                  ],
                  required: true,
                },
                {
                  type: 'STRING',
                  name: 'ordenar',
                  nameLocalizations: { 'en-US': 'order' },
                  description: 'Modo que você quer ordenar o Top',
                  descriptionLocalizations: { 'en-US': 'How you want to sort the Top' },
                  choices: [
                    {
                      name: '⭐ | Estrelinhas Ganhas',
                      nameLocalizations: { 'en-US': '⭐ | Stars Earned' },
                      value: 'money',
                    },
                    {
                      name: '👑 | Mais Vitórias',
                      nameLocalizations: { 'en-US': '👑 | Most Wins' },
                      value: 'wins',
                    },
                  ],
                  required: true,
                },
                {
                  type: 'INTEGER',
                  name: 'pagina',
                  nameLocalizations: { 'en-US': 'page' },
                  description: 'Página do top que tu quer ver',
                  descriptionLocalizations: { 'en-US': 'Top page you want to see' },
                  required: false,
                  minValue: 2,
                  maxValue: 100,
                },
              ],
            },
            {
              name: 'cacar',
              nameLocalizations: { 'en-US': 'hunt' },
              description: '「🎯」・Veja os melhores caçadores de todos os tempos',
              descriptionLocalizations: { 'en-US': '「🎯」・See the best hunters of all time' },
              type: 'SUB_COMMAND',
              options: [
                {
                  type: 'STRING',
                  name: 'caca',
                  nameLocalizations: { 'en-US': 'hunt' },
                  description: 'O tipo da caça que você quer ver',
                  descriptionLocalizations: { 'en-US': 'The kind of hunt you want to see' },
                  required: true,
                  choices: [
                    {
                      name: '😈 | Demônios',
                      nameLocalizations: { 'en-US': '😈 | Demons' },
                      value: 'demons',
                    },
                    {
                      name: '👊 | Gigantes',
                      nameLocalizations: { 'en-US': '👊 | Giants' },
                      value: 'giants',
                    },
                    {
                      name: '👼 | Anjos',
                      nameLocalizations: { 'en-US': '👼 | Angels' },
                      value: 'angels',
                    },
                    {
                      name: '🧚‍♂️ | Arcanjos',
                      nameLocalizations: { 'en-US': '🧚‍♂️ | Atchangels' },
                      value: 'archangels',
                    },
                    {
                      name: '🙌 | Semideuses',
                      nameLocalizations: { 'en-US': '🙌 | Demigods' },
                      value: 'demigods',
                    },
                    {
                      name: '✝️ | Deuses',
                      nameLocalizations: { 'en-US': '✝️ | Gods' },
                      value: 'gods',
                    },
                  ],
                },
                {
                  type: 'STRING',
                  name: 'ordenar',
                  nameLocalizations: { 'en-US': 'order' },
                  description: 'Modo que você quer ver o top',
                  descriptionLocalizations: { 'en-US': 'How do you want to see the top' },
                  choices: [
                    {
                      name: '👑 | Caças bem-sucedidas',
                      nameLocalizations: { 'en-US': '👑 | Successful Hunts' },
                      value: 'success',
                    },
                    {
                      name: '🏅 | Vezes que caçou',
                      nameLocalizations: { 'en-US': '🏅 | Times Hunted' },
                      value: 'tries',
                    },
                    {
                      name: '🍀 | Quantidade de caças',
                      nameLocalizations: { 'en-US': '🍀 | Number of Hunts' },
                      value: 'hunted',
                    },
                  ],
                  required: true,
                },
                {
                  type: 'INTEGER',
                  name: 'pagina',
                  nameLocalizations: { 'en-US': 'page' },
                  description: 'Página do top que tu quer ver',
                  descriptionLocalizations: { 'en-US': 'Top page you want to see' },
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
