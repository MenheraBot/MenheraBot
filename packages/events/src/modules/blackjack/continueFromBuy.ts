import { ButtonStyles } from 'discordeno/types';
import {
  createActionRow,
  createButton,
  generateCustomId,
  resolveCustomId,
} from '../../utils/discord/componentUtils';
import { ComponentInteraction } from '../../types/interaction';
import { collectResponseComponentInteraction } from '../../utils/discord/collectorUtils';
import starsRepository from '../../database/repositories/starsRepository';
import {
  generateBlackjackEmbed,
  getHandValue,
  getTableImage,
  hideMenheraCard,
  numbersToBlackjackCards,
  safeImageReply,
} from './blackjackMatch';
import InteractionContext from '../../structures/command/InteractionContext';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types';
import { BLACKJACK_PRIZE_MULTIPLIERS } from './index';
import { finishMatch } from './finishMatch';
import { makeDealerPlay } from './makeDealerPlay';

const continueFromBuy = async (
  ctx: InteractionContext,
  bet: number,
  oldPLayerCards: number[],
  dealerCards: number[],
  matchCards: number[],
  cardTheme: AvailableCardThemes,
  tableTheme: AvailableTableThemes,
  backgroundCardTheme: AvailableCardBackgroundThemes,
  finishCommand: () => void,
): Promise<void> => {
  const newCard = matchCards.shift() as number;
  const playerCards = [...oldPLayerCards, newCard];

  const bjPlayerCards = numbersToBlackjackCards(playerCards);
  const bjDdealerCards = numbersToBlackjackCards(dealerCards);
  const playerHandValue = getHandValue(bjPlayerCards);
  const dealerHandValue = getHandValue([bjDdealerCards[0]]);

  const image = await getTableImage(
    ctx,
    bet,
    bjPlayerCards,
    hideMenheraCard(bjDdealerCards),
    playerHandValue,
    dealerHandValue,
    cardTheme,
    tableTheme,
    backgroundCardTheme,
  );

  const embed = generateBlackjackEmbed(
    ctx,
    bjPlayerCards,
    hideMenheraCard(bjDdealerCards),
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

  safeImageReply(ctx, embed, image, [createActionRow([buyButton, stopButton])]);

  const collected = await collectResponseComponentInteraction<ComponentInteraction>(
    ctx.channelId,
    ctx.author.id,
    `${ctx.interaction.id}`,
    15_000,
  );

  if (!collected) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:blackjack.timeout'),
      embeds: [],
      attachments: [],
      components: [],
    });

    starsRepository.removeStars(ctx.author.id, bet);
    finishCommand();
    return;
  }

  if (resolveCustomId(collected.data.customId) === 'BUY') {
    const expectedNextCard = matchCards[0];
    const expectedNextPlayerCards = [...playerCards, expectedNextCard];
    const expectedNextUserBlackjackCards = numbersToBlackjackCards(expectedNextPlayerCards);
    const expectedPlayerHandValue = getHandValue(expectedNextUserBlackjackCards);

    if (expectedPlayerHandValue > 21)
      return finishMatch(
        ctx,
        bet,
        expectedNextUserBlackjackCards,
        hideMenheraCard(bjDdealerCards),
        expectedPlayerHandValue,
        dealerHandValue,
        cardTheme,
        tableTheme,
        backgroundCardTheme,
        'busted',
        false,
        0,
        finishCommand,
      );

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
  }

  if (playerHandValue === 21)
    return finishMatch(
      ctx,
      bet,
      bjPlayerCards,
      hideMenheraCard(bjDdealerCards),
      playerHandValue,
      dealerHandValue,
      cardTheme,
      tableTheme,
      backgroundCardTheme,
      'blackjack',
      true,
      BLACKJACK_PRIZE_MULTIPLIERS.blackjack,
      finishCommand,
    );

  if (playerHandValue > 21)
    return finishMatch(
      ctx,
      bet,
      bjPlayerCards,
      hideMenheraCard(bjDdealerCards),
      playerHandValue,
      dealerHandValue,
      cardTheme,
      tableTheme,
      backgroundCardTheme,
      'busted',
      false,
      BLACKJACK_PRIZE_MULTIPLIERS.base,
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
};

export { continueFromBuy };
