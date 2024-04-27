import {
  ActionRow,
  ApplicationCommandOptionTypes,
  ButtonComponent,
  ButtonStyles,
} from 'discordeno/types';
import { Embed } from 'discordeno/transformers';
import * as Sentry from '@sentry/node';
import { createCommand } from '../../structures/command/createCommand';
import {
  createActionRow,
  createButton,
  createCustomId,
  createUsersSelectMenu,
} from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import pokerRepository from '../../database/repositories/pokerRepository';
import {
  ModalInteraction,
  SelectMenuInteraction,
  SelectMenuUsersInteraction,
} from '../../types/interaction';
import { mentionUser } from '../../utils/discord/userUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags, removeNonNumbers } from '../../utils/discord/messageUtils';
import { closeTable, setupGame } from '../../modules/poker/matchManager';
import {
  executeMasterAction,
  forceRemovePlayers,
  showPlayerCards,
} from '../../modules/poker/playerControl';
import { afterLobbyAction } from '../../modules/poker/afterMatchLobby';
import userRepository from '../../database/repositories/userRepository';
import starsRepository from '../../database/repositories/starsRepository';
import { handleUserSelection, validateUserBet } from '../../modules/poker/playerBet';
import { DEFAULT_CHIPS, MAX_POKER_PLAYERS } from '../../modules/poker/constants';
import { logger } from '../../utils/logger';
import { executeGlobalPokerRelatedInteractions } from '../../modules/poker/globalPokerListener';
import { Translation } from '../../types/i18next';

const gameInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [matchId, action, lobbyAction] = ctx.sentData;

  const gameData = await pokerRepository.getMatchState(matchId);

  if (!gameData)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:poker.unknown-match'),
      embeds: [],
      components: [],
      attachments: [],
    });

  if (!gameData.players.map((a) => a.id).includes(`${ctx.user.id}`))
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:poker.not-in-match'),
      flags: MessageFlags.EPHEMERAL,
    });

  const player = gameData.players.find((a) => a.id === `${ctx.user.id}`);

  if (!player)
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('error', 'commands:poker.not-in-match'),
    });

  switch (action) {
    case 'SEE_CARDS':
      return showPlayerCards(ctx, player);
    case 'CLOSE_TABLE':
      return closeTable(ctx, gameData);
    case 'ADMIN_CONTROL':
      return executeMasterAction(ctx, gameData);
    case 'REMOVE_PLAYERS':
      return forceRemovePlayers(
        ctx as ComponentInteractionContext<SelectMenuUsersInteraction>,
        gameData,
      );
    case 'AFTER_LOBBY':
      return afterLobbyAction(ctx, gameData, lobbyAction);
    case 'GAME_ACTION':
      return handleUserSelection(
        ctx as ComponentInteractionContext<SelectMenuInteraction>,
        gameData,
        player,
      );
    case 'RAISE_BET':
      return validateUserBet(
        ctx as ComponentInteractionContext<ModalInteraction>,
        gameData,
        player,
      );
  }
};

const createStartMatchEmbed = (
  ctx: ComponentInteractionContext,
  embedColor: number,
  alreadyInPlayers: string[],
  chips: number,
): Embed =>
  createEmbed({
    title: ctx.prettyResponse(
      'wink',
      `commands:poker.match-title-${chips > 0 ? 'worth' : 'friendly'}`,
    ),
    color: embedColor,
    description: ctx.locale(
      `commands:poker.invite-description-${chips > 0 ? 'worth' : 'friendly'}`,
      {
        user: mentionUser(ctx.interaction.message?.interaction?.user.id ?? ''),
        stars: chips,
        chips: DEFAULT_CHIPS,
      },
    ),
    fields: [
      {
        name: ctx.locale('commands:poker.players-in'),
        value: alreadyInPlayers.map(mentionUser).join('\n'),
      },
    ],
  });

const selectPlayers = async (
  ctx: ComponentInteractionContext<SelectMenuUsersInteraction>,
): Promise<void> => {
  const selectedUsers = ctx.interaction.data.resolved.users;
  const selectedUsersIds = ctx.interaction.data.values;

  if (selectedUsers.some((a) => a.toggles.bot))
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:poker.bots-cant-play'),
      components: [],
    });

  if (selectedUsersIds.includes(`${ctx.user.id}`))
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:poker.dont-select-yourself'),
      components: [],
    });

  const isSomeoneInMatch = await Promise.all(selectedUsersIds.map(pokerRepository.isUserInMatch));

  if (isSomeoneInMatch.includes(true))
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:poker.someone-already-in-match'),
    });

  const isSomeoneInQueue = await Promise.all(selectedUsersIds.map(pokerRepository.isUserInQueue));

  if (isSomeoneInQueue.includes(true))
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:poker.someone-already-in-queue'),
    });

  const allUserData = await Promise.all(selectedUsersIds.map(userRepository.ensureFindUser));

  if (allUserData.some((a) => a.ban))
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:poker.someone-is-banned'),
    });

  const [embedColor, stringedChips] = ctx.sentData;
  const chips = Number(stringedChips);

  if (allUserData.some((a) => chips > a.estrelinhas))
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:poker.someone-is-poor'),
    });

  const embed = createStartMatchEmbed(
    ctx,
    hexStringToNumber(embedColor),
    [`${ctx.user.id}`],
    chips,
  );

  ctx.makeMessage({
    embeds: [embed],
    allowedMentions: { users: selectedUsersIds.map(BigInt) },
    components: [
      createActionRow([
        createButton({
          label: ctx.locale('commands:poker.accept-invite'),
          style: ButtonStyles.Primary,
          customId: createCustomId(1, 'N', ctx.commandId, 'JOIN', chips),
        }),
        createButton({
          label: ctx.locale('commands:poker.start-match'),
          style: ButtonStyles.Secondary,
          disabled: true,
          customId: createCustomId(1, ctx.user.id, ctx.commandId, 'START', chips),
        }),
      ]),
    ],
    content: selectedUsersIds.map(mentionUser).join(', '),
  });
};

const checkStartMatchInteraction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedOption, stringedChips] = ctx.sentData;
  if (selectedOption === 'JOIN') return enterMatch(ctx);

  const joinedUsers = ctx.interaction.message?.embeds?.[0].fields?.[0].value
    .split('\n')
    .map(removeNonNumbers) as string[];

  const isSomeoneInMatch = await Promise.all(joinedUsers.map(pokerRepository.isUserInMatch));

  if (isSomeoneInMatch.includes(true))
    return ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('error', 'commands:poker.someone-joined-other-match'),
    });

  const isSomeoneInQueue = await Promise.all(joinedUsers.map(pokerRepository.isUserInQueue));

  if (isSomeoneInQueue.includes(true))
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:poker.someone-already-in-queue'),
    });

  const allUserData = await Promise.all(joinedUsers.map(userRepository.ensureFindUser));

  const chips = Number(stringedChips);

  if (allUserData.some((a) => chips > a.estrelinhas))
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:poker.someone-is-poor', { stars: chips }),
    });

  await pokerRepository.addUsersInMatch(joinedUsers);

  if (chips > 0)
    joinedUsers.forEach((user) => {
      starsRepository.removeStars(user, chips);
    });

  await ctx.makeMessage({
    embeds: [],
    components: [],
    content: ctx.prettyResponse('hourglass', 'commands:poker.starting-match'),
  });

  setupGame(
    ctx,
    joinedUsers,
    ctx.interaction.message?.embeds?.[0]?.color ?? 0,
    chips,
    `${ctx.interaction.id}`,
    'LOCAL',
    ctx.guildLocale,
  );
};

const enterMatch = async (ctx: ComponentInteractionContext): Promise<void> => {
  const allowedUsers = ctx.interaction.message?.content.split(', ').map(removeNonNumbers) ?? [];

  if (!allowedUsers.includes(`${ctx.user.id}`) && ctx.user.id !== ctx.commandAuthor.id)
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('error', 'commands:poker.uninvited'),
    });

  const oldEmbed = ctx.interaction.message?.embeds[0] as Embed;

  if (typeof oldEmbed === 'undefined') {
    logger.error(`oldEmbed is undefined! Message:`, ctx.interaction.message);

    Sentry.captureMessage('oldEmbed is undefined in Poker!', {
      contexts: {
        infos: {
          allowedUsers: JSON.stringify(allowedUsers),
          oldEmbed: JSON.stringify(oldEmbed),
          interactionMessage: JSON.stringify(ctx.interaction.message),
        },
      },
      level: 'warning',
    });

    return ctx.makeMessage({
      components: [],
      embeds: [],
      attachments: [],
      content: ctx.prettyResponse('sorry', 'commands:poker.unknown-players-in'),
    });
  }

  const alreadyInPlayers = oldEmbed.fields?.[0].value.split('\n').map(removeNonNumbers) ?? [];

  if (alreadyInPlayers.includes(`${ctx.user.id}`))
    return ctx.respondInteraction({
      content: ctx.prettyResponse('wink', 'commands:poker.already-in'),
      flags: MessageFlags.EPHEMERAL,
    });

  const [, stringedChips] = ctx.sentData;
  const chips = Number(stringedChips);

  if (chips > 0) {
    const userData = await userRepository.ensureFindUser(ctx.user.id);

    if (chips > userData.estrelinhas)
      return ctx.respondInteraction({
        content: ctx.prettyResponse('error', 'commands:poker.not-enough-stars', { stars: chips }),
        flags: MessageFlags.EPHEMERAL,
      });
  }

  const oldButton = ctx.interaction.message?.components?.[0].components?.[1] as ButtonComponent;
  oldButton.disabled = false;

  if (alreadyInPlayers.length === allowedUsers.length) {
    (ctx.interaction.message?.components?.[0].components?.[0] as ButtonComponent).disabled = true;
    oldButton.style = ButtonStyles.Success;
  }

  ctx.makeMessage({
    components: (ctx.interaction.message?.components as ActionRow[]) ?? [],
    embeds: [
      createStartMatchEmbed(
        ctx,
        oldEmbed.color ?? 0,
        [...alreadyInPlayers, `${ctx.user.id}`],
        chips,
      ),
    ],
  });
};

const PokerCommand = createCommand({
  path: '',
  name: 'poker',
  description: '「💰」・Inicie uma partida de Poker',
  descriptionLocalizations: { 'en-US': '「💰」・Start a Poker match' },
  category: 'economy',
  options: [
    {
      name: 'fichas',
      description: 'Quantas fichas cada jogador vai levar para partida',
      type: ApplicationCommandOptionTypes.Integer,
      minValue: 10_000,
      nameLocalizations: {
        'en-US': 'chips',
      },
      descriptionLocalizations: {
        'en-US': 'How many chips each player will take to the match',
      },
      required: false,
    },
    {
      name: 'partida',
      description: 'Tipo de partida para jogar.',
      nameLocalizations: {
        'en-US': 'match',
      },
      descriptionLocalizations: {
        'en-US': 'Type of match to play.',
      },
      type: ApplicationCommandOptionTypes.String,
      choices: [
        {
          name: 'Local',
          value: 'local',
        },
        {
          name: 'Global',
          value: 'global',
        },
      ],
      required: false,
    },
  ],
  authorDataFields: ['estrelinhas'],
  commandRelatedExecutions: [
    selectPlayers,
    checkStartMatchInteraction,
    gameInteractions,
    executeGlobalPokerRelatedInteractions,
  ],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const matchMode = ctx.getOption('partida', false, false) ?? 'local';

    const fichas = ctx.getOption<number>('fichas', false) ?? 0;

    if (fichas > ctx.authorData.estrelinhas)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:poker.not-enough-stars', { stars: fichas }),
        flags: MessageFlags.EPHEMERAL,
      });

    const userInMatch = await pokerRepository.isUserInMatch(ctx.author.id);

    if (userInMatch)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:poker.you-already-in-match'),
        flags: MessageFlags.EPHEMERAL,
      });

    const userInQueue = await pokerRepository.isUserInQueue(ctx.user.id);

    if (userInQueue) {
      await pokerRepository.removeUsersFromQueue(ctx.user.id);

      return ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:poker.queue.removed'),
        flags: MessageFlags.EPHEMERAL,
      });
    }

    if (matchMode === 'local') {
      return ctx.makeMessage({
        content: ctx.prettyResponse('wink', 'commands:poker.select-players'),
        components: [
          createActionRow([
            createUsersSelectMenu({
              customId: createCustomId(
                0,
                ctx.author.id,
                ctx.commandId,
                ctx.authorData.selectedColor,
                fichas,
              ),
              maxValues: MAX_POKER_PLAYERS - 1,
              placeholder: ctx.locale('commands:poker.select-max-players', {
                players: MAX_POKER_PLAYERS - 1,
              }),
            }),
          ]),
        ],
      });
    }

    if (DEFAULT_CHIPS > ctx.authorData.estrelinhas)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:poker.min-global-bet', {
          stars: DEFAULT_CHIPS,
        }),
        flags: MessageFlags.EPHEMERAL,
      });

    const globalMatches = await pokerRepository.getTotalRunningGlobalMatches();

    const inQueueNow = globalMatches !== 0 ? 0 : await pokerRepository.getTotalUsersInQueue();

    const confirmButton = createButton({
      customId: createCustomId(3, ctx.user.id, ctx.commandId, 'JOIN_QUEUE'),
      label: ctx.locale('commands:poker.queue.join'),
      style: ButtonStyles.Success,
    });

    return ctx.makeMessage({
      components: [createActionRow([confirmButton])],
      flags: MessageFlags.EPHEMERAL,
      content:
        globalMatches === 0
          ? ctx.prettyResponse('time', 'commands:poker.queue.wait-message' as Translation, {
              count: inQueueNow,
            })
          : ctx.prettyResponse('success', 'commands:poker.queue.join-message'),
    });
  },
});

export default PokerCommand;
