import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';
import { makeDealerPlay } from '../../modules/blackjack/makeDealerPlay';
import starsRepository from '../../database/repositories/starsRepository';
import {
  createActionRow,
  createButton,
  generateCustomId,
  resolveCustomId,
} from '../../utils/discord/componentUtils';
import { collectResponseComponentInteraction } from '../../utils/discord/collectorUtils';
import { ComponentInteraction } from '../../types/interaction';
import { continueFromBuy } from '../../modules/blackjack/continueFromBuy';
import { finishMatch } from '../../modules/blackjack/finishMatch';
import {
  generateBlackjackEmbed,
  getHandValue,
  getTableImage,
  hideMenheraCard,
  numbersToBlackjackCards,
  safeImageReply,
} from '../../modules/blackjack/blackjackMatch';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { BLACKJACK_PRIZE_MULTIPLIERS, shuffleCards } from '../../modules/blackjack';

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
  execute: async (ctx, finishCommand) => {
    const bet = ctx.getOption<number>('aposta', false, true);

    if (ctx.authorData.estrelinhas < bet)
      return finishCommand(
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:blackjack.poor') }),
      );

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
    const dealerHandValue = getHandValue([bjDealerCards[0]]);

    if (playerHandValue === 21)
      return finishMatch(
        ctx,
        bet,
        bjPlayerCards,
        hideMenheraCard(bjDealerCards),
        playerHandValue,
        dealerHandValue,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        'init_blackjack',
        true,
        BLACKJACK_PRIZE_MULTIPLIERS.init_blackjack,
        finishCommand,
      );

    if (getHandValue(bjPlayerCards) === 21)
      return finishMatch(
        ctx,
        bet,
        bjPlayerCards,
        bjDealerCards,
        playerHandValue,
        21,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        'init_blackjack',
        false,
        BLACKJACK_PRIZE_MULTIPLIERS.init_blackjack,
        finishCommand,
      );

    const image = await getTableImage(
      ctx,
      bet,
      bjPlayerCards,
      hideMenheraCard(bjDealerCards),
      playerHandValue,
      dealerHandValue,
      cardTheme,
      tableTheme,
      backgroundCardTheme,
    );

    const embed = generateBlackjackEmbed(
      ctx,
      bjPlayerCards,
      [bjDealerCards[0]],
      playerHandValue,
      dealerHandValue,
    );

    const buyButton = createButton({
      customId: generateCustomId('BUY', ctx.interaction.id),
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:blackjack.buy'),
    });

    const stopButton = createButton({
      customId: generateCustomId('STOP', ctx.interaction.id),
      style: ButtonStyles.Danger,
      label: ctx.locale('commands:blackjack.stop'),
    });

    await safeImageReply(ctx, embed, image, [createActionRow([buyButton, stopButton])]);

    const collected = await collectResponseComponentInteraction<ComponentInteraction>(
      ctx.channelId,
      ctx.author.id,
      `${ctx.interaction.id}`,
      10_000,
    );

    if (!collected) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:blackjack.timeout'),
        embeds: [],
        attachments: [],
        components: [],
      });

      starsRepository.removeStars(ctx.author.id, bet);
      return finishCommand();
    }

    if (resolveCustomId(collected.data.customId) === 'BUY')
      return continueFromBuy(
        ctx,
        bet,
        playerCards,
        dealerCards,
        matchCards,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        finishCommand,
      );

    return makeDealerPlay(
      ctx,
      bet,
      playerCards,
      dealerCards,
      matchCards,
      cardTheme,
      tableTheme,
      backgroundCardTheme,
      finishCommand,
    );
  },
});

export default BlackjackCommand;
