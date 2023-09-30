import { TextStyles } from 'discordeno/types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction';
import {
  createActionRow,
  createCustomId,
  createTextInput,
  resolveSeparatedStrings,
} from '../../utils/discord/componentUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { extractFields } from '../../utils/discord/modalUtils';
import { getPreviousPlayableSeat, updateGameState } from './turnManager';
import { Action, PokerMatch, PokerPlayer } from './types';

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

const handleUserBet = async (
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

export { validateUserBet, handleUserBet };
