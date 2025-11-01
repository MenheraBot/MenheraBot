import { TextStyles } from '@discordeno/bot';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction.js';
import {
  createActionRow,
  createCustomId,
  createTextInput,
  resolveSeparatedStrings,
} from '../../utils/discord/componentUtils.js';
import { MessageFlags } from "@discordeno/bot";
import { extractFields } from '../../utils/discord/modalUtils.js';
import { getPreviousPlayableSeat, updateGameState } from './turnManager.js';
import { Action, PokerMatch, PokerPlayer } from './types.js';

const executeAction = (
  gameData: PokerMatch,
  player: PokerPlayer,
  action: Action,
  amount = 0,
): void => {
  switch (action) {
    case 'FOLD': {
      player.pot = 0;
      player.folded = true;
      break;
    }
    case 'CALL':
    case 'BET':
    case 'RAISE':
    case 'ALLIN': {
      const toBet = amount;
      player.chips -= toBet;
      player.pot += toBet;
      gameData.pot += toBet;
      break;
    }
  }

  if (player.pot > gameData.lastAction.pot) {
    const haveOtherPlayer =
      gameData.players.filter((a) => a.chips > 0 && !a.folded && a.seatId !== player.seatId)
        .length > 0;

    gameData.lastPlayerSeat = haveOtherPlayer
      ? getPreviousPlayableSeat(gameData, player.seatId)
      : player.seatId;

    if (action !== 'BET') gameData.raises += 1;
  }

  gameData.lastAction = {
    action,
    playerSeat: player.seatId,
    pot: action === 'FOLD' ? gameData.lastAction.pot : player.pot,
  };
};

const validateUserBet = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
  gameData: PokerMatch,
  player: PokerPlayer,
): Promise<void> => {
  const userInput = extractFields(ctx.interaction)[0].value;
  const bet = parseInt(userInput, 10);

  const minValue = ['CHECK', 'FOLD'].includes(gameData.lastAction.action)
    ? gameData.blind
    : (gameData.lastAction.pot - player.pot || gameData.blind) * 2;

  if (Number.isNaN(bet))
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:poker.player.invalid-number'),
      flags: MessageFlags.Ephemeral,
    });

  if (bet < minValue)
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:poker.player.min-bet-required', {
        chips: minValue,
      }),
      flags: MessageFlags.Ephemeral,
    });

  if (bet > player.chips)
    return ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:poker.player.too-poor'),
      flags: MessageFlags.Ephemeral,
    });

  executeAction(gameData, player, bet === player.chips ? 'ALLIN' : 'RAISE', bet);

  await ctx.ack();

  return updateGameState(ctx, gameData);
};

const handleUserSelection = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
  gameData: PokerMatch,
  player: PokerPlayer,
): Promise<void> => {
  const [action, amount] = resolveSeparatedStrings(ctx.interaction.data.values[0]) as [
    Action,
    string,
  ];

  if (action === 'RAISE-CUSTOM') {
    const minValue = ['CHECK', 'FOLD'].includes(gameData.lastAction.action)
      ? gameData.blind
      : (gameData.lastAction.pot - player.pot || gameData.blind) * 2;

    const choseValue = createTextInput({
      customId: 'BET',
      label: ctx.locale('commands:poker.player.write-your-bet', {
        chips: minValue,
      }),
      style: TextStyles.Short,
      minLength: `${minValue}`.length,
      maxLength: `${player.chips}`.length,
      required: true,
      placeholder: ctx.locale('commands:poker.player.min-bet', { chips: minValue }),
    });

    await ctx.respondWithModal({
      title: 'Raise!',
      customId: createCustomId(
        2,
        ctx.user.id,
        ctx.originalInteractionId,
        gameData.matchId,
        'RAISE_BET',
      ),
      components: [createActionRow([choseValue])],
    });
    return;
  }

  executeAction(gameData, player, action, Number(amount));

  await ctx.ack();

  return updateGameState(ctx, gameData);
};

export { validateUserBet, handleUserSelection, executeAction };
