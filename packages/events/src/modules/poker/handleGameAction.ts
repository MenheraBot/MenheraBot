/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TextStyles } from 'discordeno/types';
import pokerRepository from '../../database/repositories/pokerRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction';

import { mentionUser } from '../../utils/discord/userUtils';
import { changeStage, createTableMessage, finishRound, makeShowdown } from './matchManager';
import { Action, PokerMatch, PokerPlayer } from './types';
import {
  createActionRow,
  createCustomId,
  createTextInput,
} from '../../utils/discord/componentUtils';
import { extractFields } from '../../utils/discord/modalUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';

const getNextPlayableSeat = (match: PokerMatch, lastSeat: number): number => {
  const biggestPlayableSeat = match.players.reduce((p, c) => {
    if (c.seatId > p && !c.folded) return c.seatId;
    return p;
  }, 0);

  if (lastSeat >= biggestPlayableSeat)
    for (let i = 0; i < match.players.length; i++) {
      const player = match.players.find((a) => a.seatId === i);
      if (player && !player.folded) return player.seatId;
    }

  const nextPlayer = match.players.find((a) => a.seatId === lastSeat + 1);
  if (!nextPlayer || nextPlayer.folded) return getNextPlayableSeat(match, lastSeat + 1);

  return nextPlayer.seatId;
};

const updatePlayerTurn = (match: PokerMatch): void => {
  const nextPlayerSeatId = getNextPlayableSeat(match, match.lastAction.playerSeat);

  const lastPlayer = match.players.find((a) => a.seatId === match.lastAction.playerSeat)!;
  const nextPlayer = match.players.find((a) => a.seatId === nextPlayerSeatId)!;

  if (lastPlayer.seatId === match.lastPlayerSeat && match.lastAction.pot === nextPlayer.pot) {
    match.seatToPlay = getNextPlayableSeat(match, match.dealerSeat);
    match.lastPlayerSeat = getNextPlayableSeat(match, match.dealerSeat - 1);

    changeStage(match);
    return;
  }

  match.seatToPlay = nextPlayer.seatId;
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

  if (gameData.stage === 'showdown') return makeShowdown(ctx, gameData);

  await createTableMessage(ctx, gameData, `${mentionUser(ctx.user.id)} desistiu de sua mão.`);
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

    gameData.lastPlayerSeat = player.seatId;
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

  gameData.lastPlayerSeat = player.seatId;

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

    if (player.pot > gameData.lastAction.pot) gameData.lastPlayerSeat = player.seatId;

    gameData.lastAction = {
      action: 'ALLIN',
      playerSeat: player.seatId,
      pot: player.pot,
    };

    return updateGameState(ctx, gameData);
  }
};

export { handleGameAction, validateUserBet, getNextPlayableSeat, updatePlayerTurn };
