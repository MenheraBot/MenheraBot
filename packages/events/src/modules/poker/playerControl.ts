/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SelectMenuComponent, SelectOption } from 'discordeno/types';
import PokerSolver from 'pokersolver';
import userRepository from '../../database/repositories/userRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
  createUsersSelectMenu,
} from '../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';
import { Action, PokerMatch, PokerPlayer } from './types';
import { GenericContext } from '../../types/menhera';
import { SelectMenuUsersInteraction } from '../../types/interaction';
import pokerRepository from '../../database/repositories/pokerRepository';
import { mentionUser } from '../../utils/discord/userUtils';
import { getOpenedCards, getPokerCard } from './cardUtils';
import { Translation } from '../../types/i18next';

const showPlayerCards = async (
  ctx: ComponentInteractionContext,
  player: PokerPlayer,
  gameData: PokerMatch,
): Promise<void> => {
  await ctx.visibleAck(true);

  const image = await vanGoghRequest(VanGoghEndpoints.PokerHand, {
    cards: player.cards,
    theme: player.cardTheme,
  });

  const authorData = await userRepository.ensureFindUser(ctx.user.id);

  const cardsToUse = [
    ...player.cards.map((card) => getPokerCard(card).solverValue),
    ...getOpenedCards(gameData).map((card) => getPokerCard(card).solverValue),
  ];

  const hand = PokerSolver.Hand.solve(cardsToUse);

  const userHand = hand.descr.includes('Royal Flush')
    ? 'ROYAL-FLUSH'
    : hand.name.replaceAll(' ', '-').toUpperCase();

  const embed = createEmbed({
    title: ctx.locale('commands:poker.player.your-hand'),
    description: `**${player.cards
      .map((a) => getPokerCard(a).displayValue)
      .join(' ')}**\n\n${ctx.locale('commands:poker.player.hand-value', {
      hand: ctx.locale(`commands:poker.hands.${userHand}` as Translation),
    })}\n${ctx.locale('commands:poker.player.chips', { chips: player.chips })}`,
    footer: player.folded ? { text: ctx.locale('commands:poker.player.not-in-round') } : undefined,
    color: hexStringToNumber(authorData.selectedColor),
    image: image.err ? undefined : { url: 'attachment://poker.png' },
  });

  await ctx.makeMessage({
    embeds: [embed],
    file: image.err ? undefined : { name: 'poker.png', blob: image.data },
    flags: MessageFlags.EPHEMERAL,
  });
};

const forceRemovePlayers = async (
  ctx: ComponentInteractionContext<SelectMenuUsersInteraction>,
  gameData: PokerMatch,
): Promise<void> => {
  if (!gameData.inMatch)
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:poker.player.cant-control-off-game'),
    });

  const selectedPlayers = ctx.interaction.data?.resolved?.users;

  gameData.players.forEach((a) => {
    if (!selectedPlayers) a.willExit = true;
    else a.willExit = !selectedPlayers.has(BigInt(a.id));
  });

  await pokerRepository.setMatchState(gameData.matchId, gameData);

  const exitingPlayers = gameData.players.filter((a) => a.willExit);

  ctx.makeMessage({
    components: [],
    // @ts-expect-error This key has plural
    content: ctx.prettyResponse('success', 'commands:poker.player.remove-players', {
      player: exitingPlayers.map((a) => mentionUser(a.id)),
      count: exitingPlayers.length,
    }),
  });
};

const executeMasterAction = async (
  ctx: ComponentInteractionContext,
  gameData: PokerMatch,
): Promise<void> => {
  if (!gameData.inMatch)
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:poker.player.cant-control-off-game'),
      flags: MessageFlags.EPHEMERAL,
    });

  const ingamePlayers = createUsersSelectMenu({
    customId: createCustomId(
      2,
      gameData.masterId,
      ctx.originalInteractionId,
      gameData.matchId,
      'REMOVE_PLAYERS',
    ),
    defaultValues: gameData.players.reduce<{ id: string; type: 'user' }[]>((p, c) => {
      if (c.willExit) return p;
      p.push({ id: c.id, type: 'user' });
      return p;
    }, []),
    minValues: 0,
    placeholder: ctx.locale('commands:poker.player.ingame-players'),
    maxValues: gameData.players.length,
  });

  ctx.respondInteraction({
    components: [createActionRow([ingamePlayers])],
    content: ctx.prettyResponse('lhama', 'commands:poker.player.remove-players-message'),
    flags: MessageFlags.EPHEMERAL,
  });
};

const localizedAction = (ctx: GenericContext, action: Action, chips?: number): SelectOption => ({
  label: ctx.locale(`commands:poker.actions.${action}`),
  value: chips ? `${action}|${chips}` : action,
  description: ctx.locale(`commands:poker.actions.${action}-description`, { chips }),
});

const getPlayerBySeat = (gameData: PokerMatch, seatId: number): PokerPlayer =>
  gameData.players.find((a) => a.seatId === seatId)!;

const getAvailableActions = (ctx: GenericContext, gameData: PokerMatch): SelectMenuComponent => {
  const player = gameData.players.find((p) => p.seatId === gameData.seatToPlay)!;

  const availableActions: SelectOption[] = [localizedAction(ctx, 'FOLD')];

  if (gameData.lastAction.pot === player.pot) {
    availableActions.push(localizedAction(ctx, 'CHECK'));

    if (player.chips > gameData.blind)
      availableActions.push(localizedAction(ctx, 'BET', gameData.blind));
  }

  if (player.chips + player.pot > gameData.lastAction.pot) {
    const toRaise = ['CHECK', 'FOLD'].includes(gameData.lastAction.action)
      ? gameData.blind
      : (gameData.lastAction.pot - player.pot || gameData.blind) * 2;

    if (gameData.lastAction.pot !== player.pot) {
      availableActions.push(localizedAction(ctx, 'CALL', gameData.lastAction.pot - player.pot));

      if (player.chips >= toRaise && gameData.raises < 2)
        availableActions.push(localizedAction(ctx, 'RAISE', toRaise));
    }

    if (player.chips > toRaise && gameData.raises < 2)
      availableActions.push(localizedAction(ctx, 'RAISE-CUSTOM'));
  }

  availableActions.push(localizedAction(ctx, 'ALLIN', player.chips));

  return createSelectMenu({
    customId: createCustomId(
      2,
      player.id,
      ctx.originalInteractionId,
      gameData.matchId,
      'GAME_ACTION',
    ),
    options: availableActions,
    maxValues: 1,
    minValues: 1,
    placeholder: ctx.locale('commands:poker.player.choose-next-action', { user: player.name }),
  });
};

export {
  showPlayerCards,
  getAvailableActions,
  executeMasterAction,
  forceRemovePlayers,
  getPlayerBySeat,
};
