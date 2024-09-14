import { Embed } from 'discordeno/transformers';
import { ActionRow } from 'discordeno/types';
import { getUserAvatar } from '../../utils/discord/userUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { VanGoghEndpoints, vanGoghRequest, VanGoghReturnData } from '../../utils/vanGoghRequest';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types';
import { BlackjackCard } from './types';
import { InteractionContext } from '../../types/menhera';

const numbersToBlackjackCards = (cards: Array<number>): Array<BlackjackCard> =>
  cards.reduce((p: Array<BlackjackCard>, c: number) => {
    const multiplier = Math.ceil(c / 13) - 1;
    const newC = c - multiplier * 13;

    p.push({
      value: newC > 10 ? 10 : newC,
      isAce: newC === 1,
      id: c,
    });

    return p;
  }, []);

const getHandValue = (cards: BlackjackCard[]): number => {
  let total = cards.reduce((p, a) => a.value + p, 0);

  if (cards.some((a) => a.isAce) && total <= 11)
    total = cards.reduce((p, a) => (a.isAce && p <= 10 ? 11 : a.value) + p, 0);

  return total;
};

const getTableImage = (
  ctx: InteractionContext,
  bet: number,
  playerCards: BlackjackCard[],
  dealerCards: BlackjackCard[],
  playerHandValue: number,
  dealerHandvalue: number,
  cardTheme: AvailableCardThemes,
  tableTheme: AvailableTableThemes,
  cardBackgroundTheme: AvailableCardBackgroundThemes,
): Promise<VanGoghReturnData> => {
  return vanGoghRequest(VanGoghEndpoints.Blackjack, {
    userCards: playerCards,
    menheraCards: dealerCards,
    userTotal: playerHandValue,
    menheraTotal: dealerHandvalue,
    i18n: {
      yourHand: ctx.locale('commands:blackjack.your-hand'),
      dealerHand: ctx.locale('commands:blackjack.dealer-hand'),
    },
    aposta: bet,
    cardTheme,
    tableTheme,
    backgroundCardTheme: cardBackgroundTheme,
  });
};

const generateBlackjackEmbed = (
  ctx: InteractionContext,
  playerCards: BlackjackCard[],
  dealerCards: BlackjackCard[],
  playerHandValue: number,
  dealerHandValue: number,
  embedColor: string,
  secondCopy: boolean,
): Embed => {
  return createEmbed({
    title: ctx.prettyResponse('estrelinhas', 'commands:blackjack.title'),
    description: ctx.locale('commands:blackjack.description', {
      userHand: playerCards.map((a) => a.value).join(', '),
      userTotal: playerHandValue,
      dealerCards: dealerCards
        .filter((a) => !a.hidden)
        .map((a) => a.value)
        .join(', '),
      dealerTotal: dealerHandValue,
    }),
    footer: { text: ctx.locale(`commands:blackjack.footer${secondCopy ? '-second-copy' : ''}`) },
    color: hexStringToNumber(embedColor),
    thumbnail: { url: getUserAvatar(ctx.interaction.user, { enableGif: true }) },
    fields: [],
  });
};

const safeImageReply = async (
  ctx: InteractionContext,
  embed: Embed,
  image: VanGoghReturnData,
  components: ActionRow[],
): Promise<void> => {
  const timestamp = Date.now();

  if (image.err) return ctx.makeMessage({ embeds: [embed], attachments: [], components });

  embed.image = { url: `attachment://blackjack-${timestamp}.png` };

  ctx.makeMessage({
    embeds: [embed],
    components,
    file: { blob: image.data, name: `blackjack-${timestamp}.png` },
  });
};

const hideMenheraCard = (cards: BlackjackCard[]): BlackjackCard[] =>
  cards.map((a, i) => {
    if (i === 1) a.hidden = true;
    return a;
  });

export {
  numbersToBlackjackCards,
  getHandValue,
  getTableImage,
  generateBlackjackEmbed,
  safeImageReply,
  hideMenheraCard,
};
