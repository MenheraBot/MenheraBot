import blackjackRepository from '../../database/repositories/blackjackRepository.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { bot } from '../../index.js';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types.js';
import { postBlackjackGame, postTransaction } from '../../utils/apiRequests/statistics.js';
import { negate } from '../../utils/miscUtils.js';
import { BlackjackCard, BlackjackFinishGameReason } from './types.js';
import { ApiTransactionReason } from '../../types/api.js';
import { sendBlackjackMessage } from './sendBlackjackMessage.js';
import userRepository from '../../database/repositories/userRepository.js';
import executeDailies from '../dailies/executeDailies.js';
import { InteractionContext } from '../../types/menhera.js';

const finishMatch = async (
  ctx: InteractionContext,
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
    `### ${ctx.prettyResponse(didUserWin ? 'crown' : 'no', 'commands:blackjack.result')}\n${ctx.locale(
      `commands:blackjack.${finishReason}`,
      {
        winner,
        loser,
        prize: didUserWin ? prize : negate(prize),
        text: ctx.locale(`commands:blackjack.${didUserWin ? 'profit' : 'loss'}`),
      },
    )}`,
    false,
    'win.png',
    true,
  );

  await postBlackjackGame(`${ctx.interaction.user.id}`, didUserWin, prize);
  await blackjackRepository.invalidateBlackjackState(ctx.interaction.user.id);
};

export { finishMatch };
