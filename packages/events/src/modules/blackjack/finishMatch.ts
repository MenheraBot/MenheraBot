import starsRepository from '../../database/repositories/starsRepository';
import { bot } from '../../index';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types';
import InteractionContext from '../../structures/command/InteractionContext';
import { postBlackjackGame } from '../../utils/apiRequests/statistics';
import { negate } from '../../utils/miscUtils';
import { generateBlackjackEmbed, getTableImage, safeImageReply } from './blackjackMatch';
import { BlackjackCard, BlackjackFinishGameReason } from './types';

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
): Promise<void> => {
  const winner = didUserWin ? ctx.author.username : bot.username;
  const loser = !didUserWin ? ctx.author.username : bot.username;
  const prize = didUserWin ? Math.floor(bet * prizeMultiplier) : bet;

  if (didUserWin) starsRepository.addStars(ctx.author.id, prize);
  else starsRepository.removeStars(ctx.author.id, prize);

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
  await postBlackjackGame(`${ctx.author.id}`, didUserWin, prize);
};

export { finishMatch };
