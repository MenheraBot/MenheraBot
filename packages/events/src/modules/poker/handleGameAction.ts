/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TextStyles } from 'discordeno/types';
import pokerRepository from '../../database/repositories/pokerRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction';

import { mentionUser } from '../../utils/discord/userUtils';
import { createTableMessage, finishRound } from './matchManager';
import { Action, PokerMatch, PokerPlayer } from './types';
import {
  createActionRow,
  createCustomId,
  createTextInput,
} from '../../utils/discord/componentUtils';
import { extractFields } from '../../utils/discord/modalUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';

const updatePlayerTurn = (match: PokerMatch): void => {
  let nextSeat = match.lastAction.playerSeat + 1;

  const biggestSeat = match.players.reduce((p, c) => {
    if (c.seatId > p) return c.seatId;
    return p;
  }, 0);

  if (nextSeat > biggestSeat) nextSeat = 0;

  if (
    match.players.some((a) => a.seatId === nextSeat) &&
    match.players.find((a) => a.seatId === nextSeat)!.folded === false
  ) {
    match.seatToPlay = nextSeat;
    return;
  }

  return updatePlayerTurn(match);
};

const updateGameState = async (
  ctx: ComponentInteractionContext,
  gameData: PokerMatch,
): Promise<void> => {
  updatePlayerTurn(gameData);
  if (gameData.players.filter((a) => !a.folded).length === 1)
    return finishRound(
      ctx,
      gameData,
      [gameData.players.find((a) => a.seatId === gameData.seatToPlay)!],
      'FOLDED',
    );

  await pokerRepository.setPokerMatchState(gameData.matchId, gameData);

  createTableMessage(ctx, gameData, `${mentionUser(ctx.user.id)} desistiu de sua mão.`);
};

const validateUserBet = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
  gameData: PokerMatch,
  player: PokerPlayer,
): Promise<void> => {
  const userInput = extractFields(ctx.interaction)[0].value;
  const bet = parseInt(userInput, 10);

  const minValue = gameData.lastAction.pot - player.pot;

  if (Number.isNaN(bet))
    return ctx.respondInteraction({
      content: 'Você enviou um número inválido',
      flags: MessageFlags.EPHEMERAL,
    });

  if (bet < minValue)
    return ctx.respondInteraction({
      content: `Você precisa apostar pelo menos ${minValue} fichas!`,
      flags: MessageFlags.EPHEMERAL,
    });

  if (bet > player.chips)
    return ctx.respondInteraction({
      content: 'Você não tem todas essas fichas para apostar',
      flags: MessageFlags.EPHEMERAL,
    });

  await ctx.ack();

  if (bet === player.chips) {
    const toBet = player.chips;
    player.chips = 0;
    player.pot += toBet;
    gameData.pot += toBet;

    gameData.lastAction = {
      action: 'ALLIN',
      playerSeat: player.seatId,
      pot: player.pot,
    };

    return updateGameState(ctx, gameData);
  }

  if (bet === gameData.lastAction.pot - player.pot) {
    const toBet = gameData.lastAction.pot - player.pot;
    player.chips -= toBet;
    player.pot += toBet;
    gameData.pot += toBet;

    gameData.lastAction = {
      action: 'CALL',
      playerSeat: player.seatId,
      pot: player.pot,
    };

    return updateGameState(ctx, gameData);
  }

  player.chips -= bet;
  player.pot += bet;
  gameData.pot += bet;

  gameData.lastAction = {
    action: 'RAISE',
    playerSeat: player.seatId,
    pot: player.pot,
  };

  return updateGameState(ctx, gameData);
};

const handleGameAction = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
  gameData: PokerMatch,
  player: PokerPlayer,
): Promise<void> => {
  const action = ctx.interaction.data.values[0] as Action;

  if (action === 'RAISE') {
    const minValue = gameData.lastAction.pot - player.pot + 1;

    const choseValue = createTextInput({
      customId: 'BET',
      label: `Digite a sua aposta (Min. ${minValue})`,
      style: TextStyles.Short,
      minLength: `${minValue}`.length,
      maxLength: `${player.chips}`.length,
      required: true,
      placeholder: `O valor deve ser maior que ${minValue}`,
    });

    await ctx.respondWithModal({
      title: 'Raise!',
      customId: createCustomId(2, ctx.user.id, ctx.commandId, gameData.matchId, 'RAISE_BET'),
      components: [createActionRow([choseValue])],
    });
    return;
  }

  await ctx.ack();

  if (action === 'FOLD') {
    player.pot = 0;
    player.folded = true;

    gameData.lastAction = {
      action: 'FOLD',
      playerSeat: player.seatId,
      pot: gameData.lastAction.pot,
    };

    return updateGameState(ctx, gameData);
  }

  if (action === 'CHECK') {
    gameData.lastAction = {
      action: 'CHECK',
      playerSeat: player.seatId,
      pot: gameData.lastAction.pot,
    };

    return updateGameState(ctx, gameData);
  }

  if (action === 'CALL') {
    const toBet = gameData.lastAction.pot - player.pot;
    player.chips -= toBet;
    player.pot += toBet;
    gameData.pot += toBet;

    gameData.lastAction = {
      action: 'CALL',
      playerSeat: player.seatId,
      pot: player.pot,
    };

    return updateGameState(ctx, gameData);
  }

  if (action === 'ALLIN') {
    const toBet = player.chips;
    player.chips = 0;
    player.pot += toBet;
    gameData.pot += toBet;

    gameData.lastAction = {
      action: 'ALLIN',
      playerSeat: player.seatId,
      pot: player.pot,
    };

    return updateGameState(ctx, gameData);
  }
};

export { handleGameAction, validateUserBet };
