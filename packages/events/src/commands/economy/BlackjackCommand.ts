import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';
import { extractNameAndIdFromEmoji } from '../../utils/discord/messageUtils';
import { EMOJIS } from '../../structures/constants';
import blackjackRepository from '../../database/repositories/blackjackRepository';
import { mentionUser } from '../../utils/discord/userUtils';
import { makeDealerPlay } from '../../modules/blackjack/makeDealerPlay';
import starsRepository from '../../database/repositories/starsRepository';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
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
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';

const collectBlackjackButton = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedButton, bet, embedColor] = ctx.sentData;

  const blackjackGameData = await blackjackRepository.getBlackjackState(ctx.user.id, ctx.commandId);

  if (!blackjackGameData) {
    ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('sorry', 'commands:blackjack.lost-game-data', {
        value: bet,
        author: mentionUser(ctx.user.id),
      }),
      allowedMentions: { users: [ctx.user.id] },
      embeds: [],
      attachments: [],
    });
    await starsRepository.addStars(ctx.user.id, Number(bet));
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
    );

  const bjDealerCards = numbersToBlackjackCards(blackjackGameData.dealerCards);
  const dealerHandValue = getHandValue([bjDealerCards[0]]);

  const expectedNextCard = blackjackGameData.matchCards[0];
  const expectedNextPlayerCards = [...blackjackGameData.playerCards, expectedNextCard];
  const expectedNextUserBlackjackCards = numbersToBlackjackCards(expectedNextPlayerCards);
  const expectedPlayerHandValue = getHandValue(expectedNextUserBlackjackCards);

  const finishCommand = () => undefined;

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
      finishCommand,
      embedColor,
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
      finishCommand,
      embedColor,
    );

  await blackjackRepository.updateBlackjackState(ctx.user.id, ctx.commandId, {
    bet: blackjackGameData.bet,
    cardBackgroundTheme: blackjackGameData.cardBackgroundTheme,
    cardTheme: blackjackGameData.cardTheme,
    tableTheme: blackjackGameData.tableTheme,
    dealerCards: blackjackGameData.dealerCards,
    matchCards: blackjackGameData.matchCards,
    playerCards: blackjackGameData.playerCards,
  });

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
      required: true,
      minValue: 1,
      maxValue: 50000,
    },
  ],
  category: 'economy',
  commandRelatedExecutions: [collectBlackjackButton],
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
        finishCommand,
        ctx.authorData.selectedColor,
      );

    await starsRepository.removeStars(ctx.author.id, bet);

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
        finishCommand,
        ctx.authorData.selectedColor,
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
      cardBackgroundTheme,
    );

    const embed = generateBlackjackEmbed(
      ctx,
      bjPlayerCards,
      [bjDealerCards[0]],
      playerHandValue,
      dealerHandValue,
      ctx.authorData.selectedColor,
    );

    const buyButton = createButton({
      customId: createCustomId(
        0,
        ctx.author.id,
        ctx.commandId,
        'BUY',
        bet,
        ctx.authorData.selectedColor,
      ),
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:blackjack.buy'),
    });

    const stopButton = createButton({
      customId: createCustomId(
        0,
        ctx.author.id,
        ctx.commandId,
        'STOP',
        bet,
        ctx.authorData.selectedColor,
      ),
      style: ButtonStyles.Danger,
      label: ctx.locale('commands:blackjack.stop'),
    });

    await blackjackRepository.updateBlackjackState(ctx.author.id, ctx.commandId, {
      bet,
      cardBackgroundTheme,
      cardTheme,
      tableTheme,
      dealerCards,
      matchCards,
      playerCards,
    });

    await safeImageReply(ctx, embed, image, [createActionRow([buyButton, stopButton])]);
  },
});

export default BlackjackCommand;
