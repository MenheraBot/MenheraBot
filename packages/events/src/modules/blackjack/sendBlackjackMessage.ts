import blackjackRepository from '../../database/repositories/blackjackRepository.js';
import { InteractionContext } from '../../types/menhera.js';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types.js';
import { generateBlackjackComponents, getTableImage, safeImageReply } from './blackjackMatch.js';
import { BlackjackCard, BlackjackSession } from './types.js';

const sendBlackjackMessage = async (
  ctx: InteractionContext,
  bet: number,
  playerCards: BlackjackCard[],
  dealerCards: BlackjackCard[],
  playerHandValue: number,
  dealerHandValue: number,
  cardTheme: AvailableCardThemes,
  tableTheme: AvailableTableThemes,
  cardBackgroundTheme: AvailableCardBackgroundThemes,
  embedColor: string,
  secondCopy: boolean,
  resultText?: string,
  shuffling?: boolean,
  imageUrl?: string,
  updateImage?: boolean,
  betSession?: BlackjackSession,
): Promise<void> => {
  const image = updateImage
    ? await getTableImage(
        ctx,
        bet,
        playerCards,
        dealerCards,
        playerHandValue,
        dealerHandValue,
        cardTheme,
        tableTheme,
        cardBackgroundTheme,
      )
    : undefined;

  const toUseUrl = image?.err ? '' : imageUrl;

  if (image && !image.err && imageUrl) await blackjackRepository.setValidUrl(imageUrl);

  const components = await generateBlackjackComponents(
    ctx,
    playerCards,
    dealerCards,
    playerHandValue,
    dealerHandValue,
    embedColor,
    secondCopy,
    bet,
    resultText,
    shuffling,
    toUseUrl,
    betSession,
  );

  await safeImageReply(ctx, components, toUseUrl, image);
};

export { sendBlackjackMessage };
