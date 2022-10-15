import { ApplicationCommandOptionTypes } from 'discordeno/types';
import starsRepository from 'database/repositories/starsRepository';
import { negate } from '../../utils/miscUtils';
import { bot } from '../../index';
import {
  generateBlackjackEmbed,
  getHandValue,
  getTableImage,
  numbersToBlackjackCards,
} from '../../modules/blackjack/blackjackMatch';
import { BlackjackCard, BlackjackFinishGameReason } from '../../modules/blackjack/types';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../../modules/themes/types';
import InteractionContext from '../../structures/command/InteractionContext';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { shuffleCards } from '../../modules/blackjack';

import { createCommand } from '../../structures/command/createCommand';

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
};

const BlackjackCommand = createCommand({
  path: '',
  name: 'blackjack',
  description: '「🃏」・Disputa num jogo de BlackJack contra a Menhera',
  descriptionLocalizations: { 'en-US': '「🃏」・Dispute in a BlackJack game against Menhera' },
  options: [
    {
      name: 'aposta',
      nameLocalizations: { 'en-US': 'bet' },
      description: 'Valor da aposta',
      descriptionLocalizations: { 'en-US': 'Bet ammount' },
      type: ApplicationCommandOptionTypes.Integer,
      required: true,
      minValue: 1000,
      maxValue: 50000,
    },
  ],
  category: 'economy',
  authorDataFields: ['selectedColor', 'estrelinhas'],
  execute: async (ctx) => {
    const bet = ctx.getOption<number>('aposta', false, true);

    if (ctx.authorData.estrelinhas < bet)
      return ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:blackjack.poor') });

    await ctx.defer();

    const matchCards = shuffleCards();

    const playerCards = matchCards.splice(0, 2);
    const dealerCards = matchCards.splice(0, 2);

    const [tableTheme, cardTheme, backgroundCardTheme] = await Promise.all([
      userThemesRepository.getTableTheme(ctx.author.id),
      userThemesRepository.getCardsTheme(ctx.author.id),
      userThemesRepository.getCardBackgroundTheme(ctx.author.id),
    ]);

    const bjPlayerCards = numbersToBlackjackCards(playerCards);
    const bjDealerCards = numbersToBlackjackCards(dealerCards);
    const playerHandValue = getHandValue(bjPlayerCards);
    const dealerHandValue = getHandValue(bjDealerCards);

    if (playerHandValue === 21) return ctx.makeMessage({ content: 'WIN' });
  },
});

export default BlackjackCommand;
