import { ApplicationCommandOptionTypes, ButtonStyles } from '@discordeno/bot';
import blackjackRepository from '../../database/repositories/blackjackRepository.js';
import { makeDealerPlay } from '../../modules/blackjack/makeDealerPlay.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { createActionRow, createButton } from '../../utils/discord/componentUtils.js';
import { continueFromBuy } from '../../modules/blackjack/continueFromBuy.js';
import { finishMatch } from '../../modules/blackjack/finishMatch.js';
import {
  getHandValue,
  hideMenheraCard,
  numbersToBlackjackCards,
} from '../../modules/blackjack/blackjackMatch.js';
import userThemesRepository from '../../database/repositories/userThemesRepository.js';
import { BLACKJACK_PRIZE_MULTIPLIERS, shuffleCards } from '../../modules/blackjack/index.js';

import { createCommand } from '../../structures/command/createCommand.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { extractNameAndIdFromEmoji } from '../../utils/discord/messageUtils.js';
import { EMOJIS } from '../../structures/constants.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import { sendBlackjackMessage } from '../../modules/blackjack/sendBlackjackMessage.js';

const collectBlackjackButton = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedButton, embedColor] = ctx.sentData;

  const blackjackGameData = await blackjackRepository.getBlackjackState(ctx.user.id);

  if (!blackjackGameData) {
    ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:blackjack.no-game'),
      embeds: [],
      attachments: [],
    });
    return;
  }

  await ctx.makeMessage({
    components: [
      createActionRow([
        createButton({
          customId: 'UNCLICKABLE',
          label: ctx.locale('commands:blackjack.shuffling'),
          style: ButtonStyles.Primary,
          disabled: true,
          emoji: extractNameAndIdFromEmoji(EMOJIS.loading),
        }),
      ]),
    ],
  });

  if (selectedButton === 'STOP')
    return makeDealerPlay(
      ctx,
      blackjackGameData.bet,
      blackjackGameData.playerCards,
      blackjackGameData.dealerCards,
      blackjackGameData.matchCards,
      blackjackGameData.cardTheme,
      blackjackGameData.tableTheme,
      blackjackGameData.cardBackgroundTheme,
      embedColor,
      blackjackGameData.secondCopy,
    );

  const bjDealerCards = numbersToBlackjackCards(blackjackGameData.dealerCards);
  const dealerHandValue = getHandValue([bjDealerCards[0]]);

  const expectedNextCard = blackjackGameData.matchCards[0];
  const expectedNextPlayerCards = [...blackjackGameData.playerCards, expectedNextCard];
  const expectedNextUserBlackjackCards = numbersToBlackjackCards(expectedNextPlayerCards);
  const expectedPlayerHandValue = getHandValue(expectedNextUserBlackjackCards);

  if (expectedPlayerHandValue > 21)
    return finishMatch(
      ctx,
      blackjackGameData.bet,
      expectedNextUserBlackjackCards,
      hideMenheraCard(bjDealerCards),
      expectedPlayerHandValue,
      dealerHandValue,
      blackjackGameData.cardTheme,
      blackjackGameData.tableTheme,
      blackjackGameData.cardBackgroundTheme,
      'busted',
      false,
      0,
      embedColor,
      blackjackGameData.secondCopy,
    );

  if (expectedPlayerHandValue === 21)
    return finishMatch(
      ctx,
      blackjackGameData.bet,
      expectedNextUserBlackjackCards,
      hideMenheraCard(bjDealerCards),
      expectedPlayerHandValue,
      dealerHandValue,
      blackjackGameData.cardTheme,
      blackjackGameData.tableTheme,
      blackjackGameData.cardBackgroundTheme,
      'blackjack',
      true,
      BLACKJACK_PRIZE_MULTIPLIERS.blackjack,
      embedColor,
      blackjackGameData.secondCopy,
    );

  return continueFromBuy(
    ctx,
    blackjackGameData.bet,
    blackjackGameData.playerCards,
    blackjackGameData.dealerCards,
    blackjackGameData.matchCards,
    blackjackGameData.cardTheme,
    blackjackGameData.tableTheme,
    blackjackGameData.cardBackgroundTheme,
    embedColor,
    blackjackGameData.secondCopy,
  );
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
      required: false,
      minValue: 10,
      maxValue: 100000,
    },
  ],
  category: 'economy',
  commandRelatedExecutions: [collectBlackjackButton],
  authorDataFields: ['selectedColor', 'estrelinhas'],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const bet = ctx.getOption<number>('aposta', false) ?? -1;

    const existingMatch = await blackjackRepository.getBlackjackState(ctx.user.id);

    if (!existingMatch) {
      if (bet === -1)
        return ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:blackjack.no-game'),
        });

      if (ctx.authorData.estrelinhas < bet)
        return finishCommand(
          ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:blackjack.poor') }),
        );
    }

    await ctx.defer();

    if (existingMatch) {
      const playerCards = numbersToBlackjackCards(existingMatch.playerCards);
      const dealerCards = numbersToBlackjackCards(existingMatch.dealerCards);

      await blackjackRepository.updateBlackjackState(ctx.interaction.user.id, {
        ...existingMatch,
        secondCopy: true,
      });

      return sendBlackjackMessage(
        ctx,
        existingMatch.bet,
        playerCards,
        hideMenheraCard(dealerCards),
        getHandValue(playerCards),
        getHandValue([dealerCards[0]]),
        existingMatch.cardTheme,
        existingMatch.tableTheme,
        existingMatch.cardBackgroundTheme,
        ctx.authorData.selectedColor,
        true,
      );
    }

    const matchCards = shuffleCards();

    const playerCards = matchCards.splice(0, 2);
    const dealerCards = matchCards.splice(0, 2);

    const [tableTheme, cardTheme, cardBackgroundTheme] =
      await userThemesRepository.getThemesForBlackjack(ctx.author.id);

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
        cardBackgroundTheme,
        'init_blackjack',
        true,
        BLACKJACK_PRIZE_MULTIPLIERS.init_blackjack,
        ctx.authorData.selectedColor,
        false,
      );

    await starsRepository.removeStars(ctx.author.id, bet);

    await postTransaction(
      `${ctx.author.id}`,
      `${bot.id}`,
      bet,
      'estrelinhas',
      ApiTransactionReason.BLACKJACK_COMMAND,
    );

    if (getHandValue(bjDealerCards) === 21)
      return finishMatch(
        ctx,
        bet,
        bjPlayerCards,
        bjDealerCards,
        playerHandValue,
        21,
        cardTheme,
        tableTheme,
        cardBackgroundTheme,
        'init_blackjack',
        false,
        BLACKJACK_PRIZE_MULTIPLIERS.init_blackjack,
        ctx.authorData.selectedColor,
        false,
      );

    await blackjackRepository.updateBlackjackState(ctx.interaction.user.id, {
      bet,
      cardBackgroundTheme,
      cardTheme,
      tableTheme,
      dealerCards,
      matchCards,
      playerCards,
      secondCopy: false,
    });

    return sendBlackjackMessage(
      ctx,
      bet,
      bjPlayerCards,
      hideMenheraCard(bjDealerCards),
      playerHandValue,
      dealerHandValue,
      cardTheme,
      tableTheme,
      cardBackgroundTheme,
      ctx.authorData.selectedColor,
      false,
    );
  },
});

export default BlackjackCommand;
