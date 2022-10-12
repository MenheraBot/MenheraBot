import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { getHandValue, numbersToBlackjackCards } from 'modules/blackjack/blackjackMatch';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { shuffleCards } from '../../modules/blackjack';

import { createCommand } from '../../structures/command/createCommand';

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
