import blackjackRepository from '../../database/repositories/blackjackRepository';
import starsRepository from '../../database/repositories/starsRepository';
import { bot } from '../../index';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { postBlackjackGame, postTransaction } from '../../utils/apiRequests/statistics';
import { negate } from '../../utils/miscUtils';
import { BlackjackCard, BlackjackFinishGameReason } from './types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { ApiTransactionReason } from '../../types/api';
import { sendBlackjackMessage } from './sendBlackjackMessage';
import userRepository from '../../database/repositories/userRepository';
import executeDailies from '../dailies/executeDailies';

const finishMatch = async (
  ctx: ChatInputInteractionContext | ComponentInteractionContext,
  bet: number,
  playerCards: BlackjackCard[],
  dealerCards: BlackjackCard[],
  playerHandValue: number,
  dealerHandValue: number,
  cardTheme: AvailableCardThemes,
  tableTheme: AvailableTableThemes,
  backgroundCardTheme: AvailableCardBackgroundThemes,
  finishReason: BlackjackFinishGameReason,
  didUserWin: boolean,
  prizeMultiplier: number,
  embedColor: string,
  secondCopy: boolean,
): Promise<void> => {
  const winner = didUserWin ? ctx.interaction.user.username : bot.username;
  const loser = !didUserWin ? ctx.interaction.user.username : bot.username;

  const totalPrize = didUserWin ? Math.floor(bet * prizeMultiplier) : bet;

  const prize = finishReason === 'draw' ? bet : totalPrize;

  if (didUserWin) {
    await starsRepository.addStars(ctx.interaction.user.id, prize);
    await postTransaction(
      `${bot.id}`,
      `${ctx.interaction.user.id}`,
      prize,
      'estrelinhas',
      ApiTransactionReason.BLACKJACK_COMMAND,
    );
    const user = await userRepository.ensureFindUser(ctx.user.id);
    await executeDailies.winBet(user, 'blackjack');
    await executeDailies.winStarsInBet(user, prize);
  }

  sendBlackjackMessage(
    ctx,
    bet,
    playerCards,
    dealerCards,
    playerHandValue,
    dealerHandValue,
    cardTheme,
    tableTheme,
    backgroundCardTheme,
    embedColor,
    secondCopy,
    {
      name: ctx.prettyResponse(didUserWin ? 'crown' : 'no', 'commands:blackjack.result'),
      value: ctx.locale(`commands:blackjack.${finishReason}`, {
        winner,
        loser,
        prize: didUserWin ? prize : negate(prize),
        text: ctx.locale(`commands:blackjack.${didUserWin ? 'profit' : 'loss'}`),
      }),
    },
  );

  await postBlackjackGame(`${ctx.interaction.user.id}`, didUserWin, prize);
  await blackjackRepository.invalidateBlackjackState(ctx.interaction.user.id);
};

export { finishMatch };
