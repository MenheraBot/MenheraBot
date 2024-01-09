import blackjackRepository from '../../database/repositories/blackjackRepository';
import starsRepository from '../../database/repositories/starsRepository';
import { bot } from '../../index';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types';
import { postBlackjackGame, postTransaction } from '../../utils/apiRequests/statistics';
import { negate } from '../../utils/miscUtils';
import { generateBlackjackEmbed, getTableImage, safeImageReply } from './blackjackMatch';
import { BlackjackCard, BlackjackFinishGameReason } from './types';
import { ApiTransactionReason } from '../../types/api';
import { InteractionContext } from '../../types/menhera';

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
  blackjackId: string,
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
  }

  const image = await getTableImage(
    ctx,
    bet,
    playerCards,
    dealerCards,
    playerHandValue,
    dealerHandValue,
    cardTheme,
    tableTheme,
    backgroundCardTheme,
  );

  const embed = generateBlackjackEmbed(
    ctx,
    playerCards,
    dealerCards,
    playerHandValue,
    dealerHandValue,
    embedColor,
  );

  embed.fields?.push({
    name: ctx.prettyResponse(didUserWin ? 'crown' : 'no', 'commands:blackjack.result'),
    value: ctx.locale(`commands:blackjack.${finishReason}`, {
      winner,
      loser,
      prize: didUserWin ? prize : negate(prize),
      text: ctx.locale(`commands:blackjack.${didUserWin ? 'profit' : 'loss'}`),
    }),
  });

  embed.footer = { text: '' };

  await safeImageReply(ctx, embed, image, []);
  await postBlackjackGame(`${ctx.interaction.user.id}`, didUserWin, prize);
  await blackjackRepository.invalidateBlackjackState(ctx.interaction.user.id, blackjackId);
};

export { finishMatch };
