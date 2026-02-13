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
import { BLACKJACKER_TITLE_ID } from './index.js';
import giveRepository from '../../database/repositories/giveRepository.js';
import notificationRepository from '../../database/repositories/notificationRepository.js';

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

  const prize =
    finishReason === 'draw'
      ? bet
      : finishReason === 'init_blackjack' && didUserWin
        ? totalPrize - bet
        : totalPrize;

  const rawGain = finishReason === 'init_blackjack' && didUserWin ? prize : prize - bet;

  const user = await userRepository.ensureFindUser(ctx.user.id);

  if (didUserWin) {
    await starsRepository.addStars(ctx.interaction.user.id, prize);
    await postTransaction(
      `${bot.id}`,
      `${ctx.interaction.user.id}`,
      prize,
      'estrelinhas',
      ApiTransactionReason.BLACKJACK_COMMAND,
    );
    await executeDailies.winBet(user, 'blackjack');
    if (rawGain > 0) await executeDailies.winStarsInBet(user, rawGain);
  }

  let currentBetSession = await blackjackRepository.getBetSession(ctx.user.id);

  if (!currentBetSession)
    currentBetSession = {
      betAmount: 0,
      loses: 0,
      wins: 0,
      matches: 0,
      profit: 0,
    };

  if (finishReason != 'draw') {
    currentBetSession.betAmount += bet;
    currentBetSession.profit += didUserWin ? rawGain : -bet;
    currentBetSession[didUserWin ? 'wins' : 'loses'] += 1;
  }

  currentBetSession.matches += 1;

  if (currentBetSession.matches >= 100 && !user.titles.some((a) => a.id === BLACKJACKER_TITLE_ID)) {
    await giveRepository.giveTitleToUser(ctx.user.id, BLACKJACKER_TITLE_ID);

    notificationRepository.createNotification(
      ctx.user.id,
      'commands:notificações.notifications.lux-gave-title',
      {},
    );
  }

  await Promise.all([
    blackjackRepository.setBetSession(ctx.user.id, currentBetSession),
    blackjackRepository.invalidateBlackjackState(ctx.interaction.user.id),
  ]);

  if (rawGain > 0) postBlackjackGame(`${ctx.interaction.user.id}`, didUserWin, rawGain);

  return sendBlackjackMessage(
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
    currentBetSession,
  );
};

export { finishMatch };
