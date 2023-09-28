/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TextStyles } from 'discordeno/types';
import pokerRepository from '../../database/repositories/pokerRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction';

import { mentionUser } from '../../utils/discord/userUtils';
import {
  MAX_POKER_PLAYERS,
  changeStage,
  createTableMessage,
  distributeCards,
  executeBlinds,
  finishRound,
  makeShowdown,
} from './matchManager';
import { Action, PokerMatch, PokerPlayer } from './types';
import {
  createActionRow,
  createCustomId,
  createTextInput,
  resolveSeparatedStrings,
} from '../../utils/discord/componentUtils';
import { extractFields } from '../../utils/discord/modalUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import starsRepository from '../../database/repositories/starsRepository';
import { createEmbed } from '../../utils/discord/embedUtils';

const getNextPlayableSeat = (match: PokerMatch, lastSeat: number): number => {
  const biggestPlayableSeat = match.players.reduce((p, c) => {
    if (c.seatId > p && !c.folded && c.chips > 0) return c.seatId;
    return p;
  }, 0);

  if (lastSeat >= biggestPlayableSeat)
    for (let i = 0; i < MAX_POKER_PLAYERS; i++) {
      const player = match.players.find((a) => a.seatId === i);
      if (player && !player.folded && player.chips > 0) return player.seatId;
    }

  const nextPlayer = match.players.find((a) => a.seatId === lastSeat + 1);
  if (!nextPlayer || nextPlayer.folded || nextPlayer.chips === 0)
    return getNextPlayableSeat(match, lastSeat + 1);

  return nextPlayer.seatId;
};

const getPreviousPlayableSeat = (match: PokerMatch, lastSeat: number): number => {
  const lowestPlayableSeat = match.players.reduce((p, c) => {
    if (c.seatId < p && !c.folded && c.chips > 0) return c.seatId;
    return p;
  }, MAX_POKER_PLAYERS);

  if (lastSeat <= lowestPlayableSeat)
    for (let i = MAX_POKER_PLAYERS; i > 0; i--) {
      const player = match.players.find((a) => a.seatId === i);
      if (player && !player.folded && player.chips > 0) return player.seatId;
    }

  const previousPlayer = match.players.find((a) => a.seatId === lastSeat - 1);
  if (!previousPlayer || previousPlayer.folded || previousPlayer.chips === 0)
    return getPreviousPlayableSeat(match, lastSeat - 1);

  return previousPlayer.seatId;
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
  const playingPlayers = gameData.players.filter((a) => !a.folded);

  if (playingPlayers.length === 1)
    return finishRound(ctx, gameData, [gameData.players.find((a) => !a.folded)!], 'FOLDED');

  const canBet = playingPlayers.filter((a) => a.chips > 0);

  if (canBet.length <= 1 && gameData.lastAction.playerSeat === gameData.lastPlayerSeat)
    return makeShowdown(ctx, gameData);

  updatePlayerTurn(gameData);

  if (gameData.stage === 'showdown') return makeShowdown(ctx, gameData);

  await pokerRepository.setMatchState(gameData.matchId, gameData);
  await createTableMessage(ctx, gameData, `${mentionUser(ctx.user.id)} desistiu de sua mão.`);
};

const startNextMatch = async (
  ctx: ComponentInteractionContext,
  gameData: PokerMatch,
): Promise<void> => {
  await ctx.ack();
  gameData.inMatch = true;

  gameData.players.forEach((player) => {
    player.pot = 0;
    player.folded = false;
  });

  gameData.pot = 0;
  gameData.raises = 0;
  gameData.stage = 'preflop';
  gameData.winnerSeat = [];

  gameData.dealerSeat = getNextPlayableSeat(gameData, gameData.dealerSeat);

  distributeCards(gameData);
  executeBlinds(gameData);

  await pokerRepository.setMatchState(gameData.matchId, gameData);
  await createTableMessage(ctx, gameData);
};

const closeTable = async (
  ctx: ComponentInteractionContext,
  gameData: PokerMatch,
  followUp = false,
): Promise<void> => {
  if (gameData.worthGame)
    gameData.players.forEach((a) => {
      starsRepository.addStars(a.id, a.chips);
    });

  const sorted = gameData.players.sort((a, b) => b.chips - a.chips);
  const winner = sorted[0];

  const embed = createEmbed({
    title: 'Fim de Partida!',
    color: gameData.embedColor,
    thumbnail: { url: winner.avatar },
    description: `A partida de poker acabou! Parabéns para o vencedor **${mentionUser(
      winner.id,
    )}**\n\n**Top ${MAX_POKER_PLAYERS}**\n${sorted
      .map((a) => `1. ${mentionUser(a.id)} **${a.chips}** fichas!`)
      .join('\n')}`,
    footer: gameData.worthGame
      ? { text: 'Cada jogador recebeu o valor em estrelinhas de suas fichas' }
      : undefined,
  });

  pokerRepository.removeUsersInMatch(sorted.map((a) => a.id));
  pokerRepository.deleteMatchState(gameData.matchId);

  ctx[followUp ? 'followUp' : 'makeMessage']({
    components: [],
    attachments: [],
    content: '',
    embeds: [embed],
  });
};

const validateUserBet = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
  gameData: PokerMatch,
  player: PokerPlayer,
): Promise<void> => {
  const userInput = extractFields(ctx.interaction)[0].value;
  const bet = parseInt(userInput, 10);

  const minValue = (gameData.lastAction.pot - player.pot) * 2;

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

    gameData.raises += 1;

    gameData.lastAction = {
      action: 'ALLIN',
      playerSeat: player.seatId,
      pot: player.pot,
    };

    gameData.lastPlayerSeat = getPreviousPlayableSeat(gameData, player.seatId);
    return updateGameState(ctx, gameData);
  }

  player.chips -= bet;
  player.pot += bet;
  gameData.pot += bet;

  gameData.raises += 1;

  gameData.lastAction = {
    action: 'RAISE',
    playerSeat: player.seatId,
    pot: player.pot,
  };

  gameData.lastPlayerSeat = getPreviousPlayableSeat(gameData, player.seatId);

  return updateGameState(ctx, gameData);
};

const handleGameAction = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
  gameData: PokerMatch,
  player: PokerPlayer,
): Promise<void> => {
  const [action, amount] = resolveSeparatedStrings(ctx.interaction.data.values[0]) as [
    Action,
    string,
  ];

  if (action === 'RAISE' && amount === 'CUSTOM') {
    const minValue = (gameData.lastAction.pot - player.pot) * 2;

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
    const toBet = Number(amount);
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

  if (action === 'BET') {
    const toBet = Number(amount);
    player.chips -= toBet;
    player.pot += toBet;
    gameData.pot += toBet;

    const haveOtherPlayer =
      gameData.players.filter((a) => a.chips > 0 && !a.folded && a.seatId !== player.seatId)
        .length > 0;

    gameData.lastPlayerSeat = haveOtherPlayer
      ? getPreviousPlayableSeat(gameData, player.seatId)
      : player.seatId;

    gameData.lastAction = {
      action: 'BET',
      playerSeat: player.seatId,
      pot: player.pot,
    };

    return updateGameState(ctx, gameData);
  }

  if (action === 'RAISE') {
    const toBet = Number(amount);
    player.chips -= toBet;
    player.pot += toBet;
    gameData.pot += toBet;

    gameData.raises += 1;

    const haveOtherPlayer =
      gameData.players.filter((a) => a.chips > 0 && !a.folded && a.seatId !== player.seatId)
        .length > 0;

    gameData.lastPlayerSeat = haveOtherPlayer
      ? getPreviousPlayableSeat(gameData, player.seatId)
      : player.seatId;

    gameData.lastAction = {
      action: 'RAISE',
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

    if (player.pot > gameData.lastAction.pot) {
      const haveOtherPlayer =
        gameData.players.filter((a) => a.chips > 0 && !a.folded && a.seatId !== player.seatId)
          .length > 0;

      gameData.lastPlayerSeat = haveOtherPlayer
        ? getPreviousPlayableSeat(gameData, player.seatId)
        : player.seatId;

      gameData.raises += 1;
    }

    gameData.lastAction = {
      action: 'ALLIN',
      playerSeat: player.seatId,
      pot: player.pot,
    };

    return updateGameState(ctx, gameData);
  }
};

export {
  handleGameAction,
  startNextMatch,
  closeTable,
  validateUserBet,
  getNextPlayableSeat,
  updatePlayerTurn,
  getPreviousPlayableSeat,
};
