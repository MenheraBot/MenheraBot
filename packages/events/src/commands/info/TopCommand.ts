/* eslint-disable no-await-in-loop */
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { User } from 'discordeno/transformers';
import {
  getMostUsedCommands,
  getTopGamblingUsers,
  getTopHunters,
  getUserProfileInfo,
  getUsersThatMostUsedCommands,
} from '../../utils/apiRequests/statistics';
import { capitalize } from '../../utils/miscUtils';
import { ApiHuntingTypes } from '../../modules/hunt/types';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import { CoinflipTop, RouletteOrBichoTop } from '../../types/api';
import userRepository from '../../database/repositories/userRepository';
import InteractionContext from '../../structures/command/InteractionContext';
import { COLORS, EMOJIS } from '../../structures/constants';
import { DatabaseUserSchema } from '../../types/database';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getUserAvatar } from '../../utils/discord/userUtils';
import cacheRepository from '../../database/repositories/cacheRepository';
import { createCommand } from '../../structures/command/createCommand';

const calculateSkipCount = (page: number, documents = 1000): number => {
  if (!Number.isNaN(page) && page > 0) {
    if (page >= documents / 10) return documents / 10;
    return (page - 1) * 10;
  }
  return 0;
};

const topEmojis: { [key: string]: string } = {
  mamou: EMOJIS.crown,
  mamado: EMOJIS.lick,
  estrelinhas: EMOJIS.estrelinhas,
  demons: EMOJIS.demons,
  giants: EMOJIS.giants,
  angels: EMOJIS.angels,
  archangels: EMOJIS.archangels,
  demigods: EMOJIS.demigods,
  gods: EMOJIS.gods,
  votes: EMOJIS.ok,
  blackjack: '🃏',
  coinflip: '📀',
  roulette: '🎡',
  bicho: '🦌',
};

const executeUserDataRelatedRanking = async (
  ctx: InteractionContext,
  label: keyof DatabaseUserSchema,
  emoji: string,
  embedTitle: string,
  actor: string,
  page: number,
  color: number,
  finishCommand: () => void,
): Promise<void> => {
  const skip = calculateSkipCount(page);

  const res = await userRepository.getTopRanking(
    label,
    skip,
    await cacheRepository.getDeletedAccounts(),
  );

  const embed = createEmbed({
    title: `${emoji} | ${embedTitle} ${page > 1 ? page : 1}º`,
    color,
    fields: [],
  });

  for (let i = 0; i < res.length; i++) {
    const member = await cacheRepository.getDiscordUser(`${res[i].id}`);
    const memberName = member?.username ?? res[i].id;

    if (member) {
      if (i === 0) embed.thumbnail = { url: getUserAvatar(member, { enableGif: true }) };
      if (member.username.startsWith('Deleted User'))
        cacheRepository.addDeletedAccount([`${res[i].id}`]);
    }

    embed.fields?.push({
      name: `**${skip + 1 + i} -** ${memberName}`,
      value: `${actor}: **${res[i].value}**`,
      inline: false,
    });
  }

  ctx.makeMessage({ embeds: [embed] });
  finishCommand();
};

const executeMostUsedCommands = async (
  ctx: InteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  const res = await getMostUsedCommands();

  if (!res) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });

    return finishCommand();
  }

  const embed = createEmbed({
    title: ctx.prettyResponse('robot', 'commands:top.commands'),
    color: 0xf47fff,
    fields: [],
  });

  for (let i = 0; i < res.length; i++)
    embed.fields?.push({
      name: `**${i + 1} -** ${capitalize(res[i].name)}`,
      value: `${ctx.locale('commands:top.used')} **${res[i].usages}** ${ctx.locale(
        'commands:top.times',
      )}`,
      inline: false,
    });

  ctx.makeMessage({ embeds: [embed] });
  finishCommand();
};

const executeMostUsersThatUsedCommands = async (
  ctx: InteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  const res = await getUsersThatMostUsedCommands();

  if (!res) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });

    return finishCommand();
  }

  const embed = createEmbed({
    title: ctx.prettyResponse('smile', 'commands:top.users'),
    color: 0xf47fff,
    fields: [],
  });

  for (let i = 0; i < res.length; i++) {
    const member = await cacheRepository.getDiscordUser(res[i].id);

    if (member) {
      if (i === 0) embed.thumbnail = { url: getUserAvatar(member, { enableGif: true }) };
      if (member.username.startsWith('Deleted User'))
        cacheRepository.addDeletedAccount([res[i].id]);
    }

    embed.fields?.push({
      name: `**${i + 1} -** ${capitalize(member?.username ?? res[i].id)}`,
      value: `${ctx.locale('commands:top.use')} **${res[i].uses}** ${ctx.locale(
        'commands:top.times',
      )}`,
      inline: false,
    });
  }

  ctx.makeMessage({ embeds: [embed] });

  finishCommand();
};

const executeMostUsedCommandsFromUser = async (
  ctx: InteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  const user = ctx.getOption<User>('user', 'users') ?? ctx.author;

  if (!user) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:top.not-user') });

    return finishCommand();
  }

  const res = await getUserProfileInfo(user.id);

  if (!res || res.cmds.count === 0) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:top.not-user') });

    return finishCommand();
  }

  const embed = createEmbed({
    title: ctx.prettyResponse('smile', 'commands:top.user', { user: user.username }),
    color: 0xf47fff,
    fields: [],
  });

  for (let i = 0; i < res.array.length; i++) {
    if (i > 10) break;

    embed.fields?.push({
      name: `**${i + 1} -** ${capitalize(res.array[i].name)}`,
      value: `${ctx.locale('commands:top.use')} **${res.array[i].count}** ${ctx.locale(
        'commands:top.times',
      )}`,
      inline: false,
    });
  }

  ctx.makeMessage({ embeds: [embed] });
  finishCommand();
};

const executeHuntStatistics = async (
  ctx: InteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  const huntType = ctx.getOption<ApiHuntingTypes>('caça', false, true);
  const topMode = ctx.getOption<'success'>('ordenar', false, true);
  const page = ctx.getOption<number>('página', false) ?? 0;
  const skip = calculateSkipCount(page);

  const bannedUsers = blacklistRepository.getAllBannedUsersId();
  const deletedAccounts = cacheRepository.getDeletedAccounts();

  const usersToIgnore = await Promise.all([bannedUsers, deletedAccounts]).then((a) =>
    a[0].concat(a[1]),
  );

  const results = await getTopHunters(skip, usersToIgnore, huntType, topMode);

  if (!results) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });

    return finishCommand();
  }

  const embed = createEmbed({
    title: ctx.locale('commands:top.estatisticas.cacar.title', {
      type: ctx.locale(`commands:top.estatisticas.cacar.${huntType}`),
      page: page > 1 ? page : 1,
      emoji: topEmojis[`${huntType}s`],
    }),
    description: ctx.locale(`commands:top.estatisticas.cacar.description.${topMode}`),
    color: COLORS.Pinkie,
    fields: [],
  });

  for (let i = 0; i < results.length; i++) {
    const member = await cacheRepository.getDiscordUser(results[i].user_id);

    if (member) {
      if (i === 0) embed.thumbnail = { url: getUserAvatar(member, { enableGif: true }) };
      if (member.username.startsWith('Deleted User'))
        cacheRepository.addDeletedAccount([`${member.id}`]);
    }

    const userData = results[i];

    embed.fields?.push({
      name: `**${skip + i + 1} -** ${capitalize(member?.username ?? userData.user_id)}`,
      value: ctx.locale('commands:top.estatisticas.cacar.description.text', {
        hunted: userData[`${huntType}_hunted`],
        success: userData[`${huntType}_success`],
        tries: userData[`${huntType}_tries`],
      }),
      inline: true,
    });
  }

  ctx.makeMessage({ embeds: [embed] });
  finishCommand();
};

const topUserResponseBasedBets = async (ctx: InteractionContext, finishCommand: () => void) => {
  const gameMode = ctx.getOption<'bicho' | 'roulette'>('jogo', false, true);
  const topMode = ctx.getOption<'money'>('ordenar', false, true);
  const page = ctx.getOption<number>('página', false) ?? 0;
  const skip = calculateSkipCount(page);

  const bannedUsers = blacklistRepository.getAllBannedUsersId();
  const deletedAccounts = cacheRepository.getDeletedAccounts();

  const usersToIgnore = await Promise.all([bannedUsers, deletedAccounts]).then((a) =>
    a[0].concat(a[1]),
  );

  const results = (await getTopGamblingUsers(
    skip,
    usersToIgnore,
    topMode,
    gameMode,
  )) as RouletteOrBichoTop[];

  if (!results) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });

    return finishCommand();
  }

  const embed = createEmbed({
    title: ctx.locale('commands:top.estatisticas.apostas.title', {
      type: ctx.locale(`commands:top.estatisticas.apostas.${gameMode}`),
      page: page > 1 ? page : 1,
      emoji: topEmojis[gameMode],
    }),
    description: ctx.locale(`commands:top.estatisticas.apostas.description.${topMode}`),
    color: COLORS.Pinkie,
    fields: [],
  });

  for (let i = 0; i < results.length; i++) {
    const member = await cacheRepository.getDiscordUser(results[i].user_id);

    if (member) {
      if (i === 0) embed.thumbnail = { url: getUserAvatar(member, { enableGif: true }) };

      if (member.username.startsWith('Deleted Account'))
        cacheRepository.addDeletedAccount([`${member.id}`]);
    }

    const userData = results[i];

    embed.fields?.push({
      name: `**${skip + i + 1} -** ${capitalize(member?.username ?? `${results[i].user_id}`)}`,
      value: ctx.locale('commands:top.estatisticas.apostas.description.text', {
        earnMoney: userData.earn_money.toLocaleString(ctx.interaction.locale),
        lostMoney: userData.lost_money.toLocaleString(ctx.interaction.locale),
        lostGames: userData.lost_games,
        wonGames: userData.won_games,
        winPercentage:
          (((userData.won_games ?? 0) / (userData.won_games + userData.lost_games)) * 100).toFixed(
            2,
          ) || 0,
        lostPercentage:
          (((userData.lost_games ?? 0) / (userData.won_games + userData.lost_games)) * 100).toFixed(
            2,
          ) || 0,
      }),
      inline: false,
    });
  }

  ctx.makeMessage({ embeds: [embed] });
  finishCommand();
};

const topAccountResponseBets = async (ctx: InteractionContext, finishCommand: () => void) => {
  const gameMode = ctx.getOption<'blackjack' | 'coinflip'>('jogo', false, true);
  const topMode = ctx.getOption<'money'>('ordenar', false, true);
  const page = ctx.getOption<number>('página', false) ?? 0;
  const skip = calculateSkipCount(page);

  const bannedUsers = blacklistRepository.getAllBannedUsersId();
  const deletedAccounts = cacheRepository.getDeletedAccounts();

  const usersToIgnore = await Promise.all([bannedUsers, deletedAccounts]).then((a) =>
    a[0].concat(a[1]),
  );

  const results = (await getTopGamblingUsers(
    skip,
    usersToIgnore,
    topMode,
    gameMode,
  )) as CoinflipTop[];

  if (!results) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });

    return finishCommand();
  }

  const embed = createEmbed({
    title: ctx.locale('commands:top.estatisticas.apostas.title', {
      type: ctx.locale(`commands:top.estatisticas.apostas.${gameMode}`),
      page: page > 1 ? page : 1,
      emoji: topEmojis[gameMode],
    }),
    description: ctx.locale(`commands:top.estatisticas.apostas.description.${topMode}`),
    color: COLORS.Pinkie,
    fields: [],
  });

  for (let i = 0; i < results.length; i++) {
    const member = await cacheRepository.getDiscordUser(results[i].id);

    if (member) {
      if (i === 0) embed.thumbnail = { url: getUserAvatar(member, { enableGif: true }) };

      if (member.username.startsWith('Deleted Account'))
        cacheRepository.addDeletedAccount([`${member.id}`]);
    }

    const userData = results[i];

    const baseField = (gameMode === 'blackjack' ? 'bj' : 'cf') as 'cf';

    embed.fields?.push({
      name: `**${skip + i + 1} -** ${capitalize(member?.username ?? `${userData.id}`)}`,
      value: ctx.locale('commands:top.estatisticas.apostas.description.text', {
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
      inline: false,
    });
  }

  ctx.makeMessage({ embeds: [embed] });
  finishCommand();
};

const TopCommand = createCommand({
  path: '',
  name: 'top',
  description: '「💹」・Veja o top de usuários da Menhera',
  descriptionLocalizations: { 'en-US': "「💹」・See Menhera's top users" },
  category: 'info',
  options: [
    {
      name: 'caças',
      nameLocalizations: { 'en-US': 'hunting' },
      type: ApplicationCommandOptionTypes.SubCommand,
      description: '「🎯」・Veja o top caçadores atuais da Menhera',
      descriptionLocalizations: { 'en-US': "「🎯」・See Menhera's current top hunters" },
      options: [
        {
          type: ApplicationCommandOptionTypes.String,
          name: 'caça',
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
              nameLocalizations: { 'en-US': '🧚‍♂️ | Archangels' },
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
          type: ApplicationCommandOptionTypes.Integer,
          name: 'página',
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
      type: ApplicationCommandOptionTypes.SubCommand,
      description: '「⭐」・Veja os melhores usuários da Menhera',
      descriptionLocalizations: { 'en-US': "「⭐」・See Menhera's best users" },
      options: [
        {
          type: ApplicationCommandOptionTypes.String,
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
          type: ApplicationCommandOptionTypes.Integer,
          name: 'página',
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
      type: ApplicationCommandOptionTypes.SubCommand,
      name: 'comandos',
      nameLocalizations: { 'en-US': 'commands' },
      description: '「📟」・Veja os melhores sobre os comandos',
      descriptionLocalizations: { 'en-US': '「📟」・See the best about commands' },
      options: [
        {
          type: ApplicationCommandOptionTypes.String,
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
          type: ApplicationCommandOptionTypes.User,
          name: 'user',
          description: 'Usuário para ver os comandos mais usados',
          descriptionLocalizations: { 'en-US': 'User to see most used commands' },
          required: false,
        },
      ],
    },
    {
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      name: 'estatísticas',
      nameLocalizations: { 'en-US': 'statistics' },
      description: '「📊」・Veja os melhores em termos de estatísticas',
      descriptionLocalizations: { 'en-US': '「📊」・See the best in terms of stats' },
      options: [
        {
          name: 'apostas',
          nameLocalizations: { 'en-US': 'bets' },
          description: '「📊」・Veja os melhores apostadores',
          descriptionLocalizations: { 'en-US': '「📊」・See the best bettors' },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: 'jogo',
              nameLocalizations: { 'en-US': 'game' },
              description: 'Jogo de apostas que você quer ver',
              descriptionLocalizations: { 'en-US': 'Betting game you want to see' },
              type: ApplicationCommandOptionTypes.String,
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
              type: ApplicationCommandOptionTypes.String,
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
              type: ApplicationCommandOptionTypes.Integer,
              name: 'página',
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
          name: 'caçar',
          nameLocalizations: { 'en-US': 'hunt' },
          description: '「🎯」・Veja os melhores caçadores de todos os tempos',
          descriptionLocalizations: { 'en-US': '「🎯」・See the best hunters of all time' },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              type: ApplicationCommandOptionTypes.String,
              name: 'caça',
              nameLocalizations: { 'en-US': 'hunt' },
              description: 'O tipo da caça que você quer ver',
              descriptionLocalizations: { 'en-US': 'The kind of hunt you want to see' },
              required: true,
              choices: [
                {
                  name: '😈 | Demônios',
                  value: 'demon',
                  nameLocalizations: { 'en-US': '😈 | Demons' },
                },
                {
                  name: '👊 | Gigantes',
                  value: 'giant',
                  nameLocalizations: { 'en-US': '👊 | Giants' },
                },
                {
                  name: '👼 | Anjos',
                  value: 'angel',
                  nameLocalizations: { 'en-US': '👼 | Angels' },
                },
                {
                  name: '🧚‍♂️ | Arcanjos',
                  value: 'archangel',
                  nameLocalizations: { 'en-US': '🧚‍♂️ | Archangels' },
                },
                {
                  name: '🙌 | Semideuses',
                  value: 'demigod',
                  nameLocalizations: { 'en-US': '🙌 | Demigods' },
                },
                {
                  name: '✝️ | Deuses',
                  value: 'god',
                  nameLocalizations: { 'en-US': '✝️ | Gods' },
                },
              ],
            },
            {
              type: ApplicationCommandOptionTypes.String,
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
              type: ApplicationCommandOptionTypes.Integer,
              name: 'página',
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
  authorDataFields: ['selectedColor', 'inUseItems', 'inventory', 'id', 'itemsLimit'],
  execute: async (ctx, finishCommand) => {
    const command = ctx.getSubCommand();

    await ctx.defer();

    switch (command) {
      case 'caças':
      case 'economia': {
        const type = ctx.getOption<keyof DatabaseUserSchema>(
          command === 'caças' ? 'caça' : 'tipo',
          false,
          true,
        );

        const page = ctx.getOption<number>('página', false) ?? 0;

        return executeUserDataRelatedRanking(
          ctx,
          type,
          topEmojis[type],
          ctx.locale(`commands:top.economia.${type as 'mamou'}-title`),
          ctx.locale(`commands:top.economia.${type as 'mamou'}`),
          page,
          COLORS.Purple,
          finishCommand,
        );
      }
      case 'comandos': {
        const type = ctx.getOption<'commands' | 'users' | 'user'>('tipo', false, true);

        if (type === 'commands') return executeMostUsedCommands(ctx, finishCommand);
        if (type === 'users') return executeMostUsersThatUsedCommands(ctx, finishCommand);
        return executeMostUsedCommandsFromUser(ctx, finishCommand);
      }

      case 'caçar':
        return executeHuntStatistics(ctx, finishCommand);

      case 'apostas': {
        const gameMode = ctx.getOption('jogo', false, true);

        if (gameMode === 'roulette' || gameMode === 'bicho')
          return topUserResponseBasedBets(ctx, finishCommand);

        return topAccountResponseBets(ctx, finishCommand);
      }
    }
  },
});

export default TopCommand;
