import { ApplicationCommandOptionTypes, MessageFlags, TextStyles } from '@discordeno/bot';
import blackjackRepository from '../../database/repositories/blackjackRepository.js';
import { makeDealerPlay } from '../../modules/blackjack/makeDealerPlay.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import {
  createCustomId,
  createLabel,
  createTextDisplay,
  createTextInput,
} from '../../utils/discord/componentUtils.js';
import { continueFromBuy } from '../../modules/blackjack/continueFromBuy.js';
import { finishMatch } from '../../modules/blackjack/finishMatch.js';
import {
  getHandValue,
  hideMenheraCard,
  numbersToBlackjackCards,
} from '../../modules/blackjack/blackjackMatch.js';
import userThemesRepository from '../../database/repositories/userThemesRepository.js';
import {
  BLACKJACK_MAX_BET,
  BLACKJACK_MIN_BET,
  BLACKJACK_PRIZE_MULTIPLIERS,
  shuffleCards,
} from '../../modules/blackjack/index.js';

import { createCommand } from '../../structures/command/createCommand.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import { sendBlackjackMessage } from '../../modules/blackjack/sendBlackjackMessage.js';
import userRepository from '../../database/repositories/userRepository.js';
import { InteractionContext } from '../../types/menhera.js';
import { DatabaseUserSchema } from '../../types/database.js';
import { calculateProbability } from '../../utils/miscUtils.js';
import { extractLayoutFields } from '../../utils/discord/modalUtils.js';
import { ModalInteraction } from '../../types/interaction.js';
import { EMOJIS } from '../../structures/constants.js';

const initBlackjackGame = async (
  ctx: InteractionContext,
  bet: number,
  userData: DatabaseUserSchema,
) => {
  const matchCards = shuffleCards();

  const playerCards = matchCards.splice(0, 2);
  const dealerCards = matchCards.splice(0, 2);

  const [tableTheme, cardTheme, cardBackgroundTheme] =
    await userThemesRepository.getThemesForBlackjack(ctx.user.id);

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
      userData.selectedColor,
      false,
    );

  await starsRepository.removeStars(ctx.user.id, bet);

  await postTransaction(
    `${ctx.user.id}`,
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
      userData.selectedColor,
      false,
    );

  const attachmentUrl = `blackjack-${Date.now()}.png`;

  await blackjackRepository.updateBlackjackState(ctx.interaction.user.id, {
    bet,
    cardBackgroundTheme,
    cardTheme,
    tableTheme,
    dealerCards,
    matchCards,
    playerCards,
    secondCopy: false,
    lastAttachmentUrl: attachmentUrl,
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
    userData.selectedColor,
    false,
    '',
    false,
    attachmentUrl,
    true,
  );
};

const sendStartingGameMessage = async (ctx: InteractionContext, betAmount: number) => {
  const randomMessage = calculateProbability([
    {
      probability: 120,
      value: ctx.prettyResponse('time', 'commands:blackjack.restarting-game', {
        bet: betAmount,
      }),
    },
    {
      probability: 1,
      value: `> ${ctx.prettyResponse('badge_6', 'commands:blackjack.easter-egg-restarting-game')}`,
    },
  ]);

  if (!randomMessage.includes(EMOJIS.badge_6))
    return ctx.makeLayoutMessage({
      components: [createTextDisplay(randomMessage)],
    });

  await ctx.makeLayoutMessage({
    components: [createTextDisplay(randomMessage)],
  });

  await new Promise((r) => setTimeout(r, 2000));
};

const collectBlackjackButton = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedButton, embedColor, bet] = ctx.sentData;

  const blackjackGameData = await blackjackRepository.getBlackjackState(ctx.user.id);

  if (selectedButton.startsWith('NEW_GAME')) {
    if (blackjackGameData)
      return ctx.makeLayoutMessage({
        components: [
          createTextDisplay(ctx.prettyResponse('error', 'commands:blackjack.another-message')),
        ],
      });

    const userData = await userRepository.ensureFindUser(ctx.user.id);

    if (userData.estrelinhas < BLACKJACK_MIN_BET)
      return ctx.makeLayoutMessage({
        flags: MessageFlags.Ephemeral,
        components: [createTextDisplay(ctx.prettyResponse('error', 'commands:blackjack.poor'))],
      });

    const betAmount = Number(bet);

    if (selectedButton === 'NEW_GAME') {
      if (betAmount > userData.estrelinhas)
        return ctx.makeLayoutMessage({
          flags: MessageFlags.Ephemeral,
          components: [createTextDisplay(ctx.prettyResponse('error', 'commands:blackjack.poor'))],
        });

      await sendStartingGameMessage(ctx, betAmount);

      return initBlackjackGame(ctx, betAmount, userData);
    }

    if (selectedButton === 'NEW_GAME_AMOUNT') {
      const maxValue = Math.min(BLACKJACK_MAX_BET, userData.estrelinhas);

      return ctx.respondWithModal({
        title: ctx.locale('commands:blackjack.place-bet'),
        customId: createCustomId(
          0,
          ctx.user.id,
          ctx.originalInteractionId,
          'NEW_GAME_MODAL',
          embedColor,
          betAmount,
        ),
        components: [
          createLabel({
            label: ctx.locale('commands:blackjack.place-bet'),
            description: ctx.locale('commands:blackjack.max-min-bet', {
              min: BLACKJACK_MIN_BET,
              max: maxValue,
            }),
            component: createTextInput({
              customId: 'estrelinhas',
              style: TextStyles.Short,
              placeholder: `${maxValue}`,
              minLength: `${BLACKJACK_MIN_BET}`.length,
              maxLength: `${maxValue}`.length,
            }),
          }),
        ],
      });
    }

    const sentValue = extractLayoutFields(ctx.interaction as ModalInteraction);
    const numberedValue = parseInt(sentValue[0].value ?? '');

    if (
      Number.isNaN(numberedValue) ||
      numberedValue < BLACKJACK_MIN_BET ||
      numberedValue > userData.estrelinhas
    )
      return ctx.makeLayoutMessage({
        flags: MessageFlags.Ephemeral,
        components: [createTextDisplay(ctx.prettyResponse('error', 'commands:blackjack.poor'))],
      });

    await sendStartingGameMessage(ctx, numberedValue);

    return initBlackjackGame(ctx, numberedValue, userData);
  }

  if (!blackjackGameData)
    return ctx.makeLayoutMessage({
      components: [createTextDisplay(ctx.prettyResponse('error', 'commands:blackjack.no-game'))],
      attachments: [],
    });

  const currentPlayerCards = numbersToBlackjackCards(blackjackGameData.playerCards);
  const currentDealerCards = numbersToBlackjackCards(blackjackGameData.dealerCards);
  const hiddenDealerCards = hideMenheraCard(currentDealerCards);
  const playerHandValue = getHandValue(currentPlayerCards);
  const dealerHandValue = getHandValue([currentDealerCards[0]]);

  const imageExists = await blackjackRepository.isUrlValid(blackjackGameData.lastAttachmentUrl);

  await sendBlackjackMessage(
    ctx,
    blackjackGameData.bet,
    currentPlayerCards,
    hiddenDealerCards,
    playerHandValue,
    dealerHandValue,
    blackjackGameData.cardTheme,
    blackjackGameData.tableTheme,
    blackjackGameData.cardBackgroundTheme,
    embedColor,
    blackjackGameData.secondCopy,
    '',
    true,
    imageExists ? blackjackGameData.lastAttachmentUrl : '',
    false,
  );

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

  const expectedNextCard = blackjackGameData.matchCards[0];
  const expectedNextPlayerCards = [...blackjackGameData.playerCards, expectedNextCard];
  const expectedNextUserBlackjackCards = numbersToBlackjackCards(expectedNextPlayerCards);
  const expectedPlayerHandValue = getHandValue(expectedNextUserBlackjackCards);

  if (expectedPlayerHandValue > 21)
    return finishMatch(
      ctx,
      blackjackGameData.bet,
      expectedNextUserBlackjackCards,
      hiddenDealerCards,
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
      hiddenDealerCards,
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
      minValue: BLACKJACK_MIN_BET,
      maxValue: BLACKJACK_MAX_BET,
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
        return ctx.makeLayoutMessage({
          components: [
            createTextDisplay(ctx.prettyResponse('error', 'commands:blackjack.no-game')),
          ],
          flags: MessageFlags.Ephemeral,
        });

      if (ctx.authorData.estrelinhas < bet)
        return ctx.makeLayoutMessage({
          flags: MessageFlags.Ephemeral,
          components: [createTextDisplay(ctx.prettyResponse('error', 'commands:blackjack.poor'))],
        });
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
        '',
        false,
        existingMatch.lastAttachmentUrl,
        true,
      );
    }

    await blackjackRepository.destroyBetSession(ctx.user.id);

    return initBlackjackGame(ctx, bet, ctx.authorData);
  },
});

export default BlackjackCommand;
