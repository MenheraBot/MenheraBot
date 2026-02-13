import { ButtonStyles, ContainerComponent } from '@discordeno/bot';
import { getUserAvatar } from '../../utils/discord/userUtils.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { VanGoghEndpoints, vanGoghRequest, VanGoghReturnData } from '../../utils/vanGoghRequest.js';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types.js';
import { BlackjackCard } from './types.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { InteractionContext } from '../../types/menhera.js';
import {
  createActionRow,
  createButton,
  createContainer,
  createCustomId,
  createMediaGallery,
  createSection,
  createSeparator,
  createTextDisplay,
  createThumbnail,
} from '../../utils/discord/componentUtils.js';
import { EMOJIS } from '../../structures/constants.js';
import userRepository from '../../database/repositories/userRepository.js';

const numbersToBlackjackCards = (cards: number[]): BlackjackCard[] =>
  cards.reduce((p: BlackjackCard[], c: number) => {
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
  ctx: ChatInputInteractionContext | ComponentInteractionContext,
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

const getCardNaipe = (cardId: number): string =>
  ({
    0: EMOJIS.naipe_spades,
    1: EMOJIS.naipe_hearts,
    2: EMOJIS.naipe_diamons,
    3: EMOJIS.naipe_clubs,
  })[Math.floor(cardId % 14)] ?? '';

const generateBlackjackComponents = async (
  ctx: InteractionContext,
  playerCards: BlackjackCard[],
  dealerCards: BlackjackCard[],
  playerHandValue: number,
  dealerHandValue: number,
  embedColor: string,
  secondCopy: boolean,
  betAmount: number,
  resultText?: string,
  shuffling?: boolean,
  attachmentUrl?: string,
): Promise<ContainerComponent[]> => {
  const userData = await userRepository.ensureFindUser(ctx.user.id);

  return [
    createContainer({
      accentColor: hexStringToNumber(embedColor),
      components: [
        createSection({
          accessory: createThumbnail(getUserAvatar(ctx.interaction.user, { enableGif: true })),
          components: [
            createTextDisplay(`## ${ctx.prettyResponse('blackjack', 'commands:blackjack.title')}`),
            createTextDisplay(
              ctx.locale('commands:blackjack.description', {
                userHand: playerCards.map((a) => `${a.value} ${getCardNaipe(a.id)}`).join(', '),
                userTotal: playerHandValue,
                dealerCards: dealerCards
                  .filter((a) => !a.hidden)
                  .map((a) => `${a.value} ${getCardNaipe(a.id)}`)
                  .join(', '),
                dealerTotal: dealerHandValue,
              }),
            ),
          ],
        }),
        ...(attachmentUrl
          ? [
              createSeparator(),
              createMediaGallery([{ media: { url: `attachment://${attachmentUrl}` } }]),
            ]
          : []),
        ...(resultText
          ? []
          : [
              createSeparator(),
              createTextDisplay(
                `### ${ctx.prettyResponse('question', 'commands:blackjack.ask-action')}`,
              ),
              createActionRow([
                createButton({
                  customId: createCustomId(
                    0,
                    ctx.interaction.user.id,
                    ctx.originalInteractionId,
                    'BUY',
                    embedColor,
                  ),
                  disabled: shuffling,
                  style: ButtonStyles.Primary,
                  label: ctx.locale(`commands:blackjack.${shuffling ? 'shuffling' : 'buy'}`),
                  emoji: { name: ctx.safeEmoji('blackjack', true) },
                }),
                ...(shuffling
                  ? []
                  : [
                      createButton({
                        customId: createCustomId(
                          0,
                          ctx.interaction.user.id,
                          ctx.originalInteractionId,
                          'STOP',
                          embedColor,
                        ),
                        disabled: shuffling,
                        emoji: { name: ctx.safeEmoji('no') },
                        style: ButtonStyles.Secondary,
                        label: ctx.locale('commands:blackjack.stop'),
                      }),
                    ]),
              ]),
            ]),
        createSeparator(),
        createTextDisplay(
          resultText ||
            `-# ${ctx.locale(`commands:blackjack.footer${secondCopy ? '-second-copy' : ''}`)}`,
        ),
        ...(resultText
          ? [
              createActionRow([
                createButton({
                  style: ButtonStyles.Success,
                  customId: createCustomId(
                    0,
                    ctx.user.id,
                    ctx.originalInteractionId,
                    'NEW_GAME',
                    embedColor,
                    betAmount,
                  ),
                  label: ctx.locale('commands:blackjack.new-game'),
                  emoji: { name: ctx.safeEmoji('estrelinhas') },
                  disabled: betAmount > userData.estrelinhas,
                }),
                createButton({
                  style: ButtonStyles.Primary,
                  customId: createCustomId(
                    0,
                    ctx.user.id,
                    ctx.originalInteractionId,
                    embedColor,
                    'NEW_GAME_AMOUNT',
                  ),
                  emoji: { name: ctx.safeEmoji('estrelinhas') },
                  disabled: userData.estrelinhas < 10,
                  label: ctx.locale('commands:blackjack.new-game-value'),
                }),
              ]),
            ]
          : []),
      ],
    }),
  ];
};

const safeImageReply = async (
  ctx: InteractionContext,
  components: ContainerComponent[],
  imageUrl?: string,
  image?: VanGoghReturnData,
): Promise<void> => {
  if (image && image.err) return ctx.makeLayoutMessage({ attachments: [], components });

  if (!image) {
    return ctx.makeLayoutMessage({
      components,
    });
  }

  return ctx.makeLayoutMessage({
    components,
    files: [{ blob: image.data, name: imageUrl || 'NONE.png' }],
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
  generateBlackjackComponents,
  safeImageReply,
  hideMenheraCard,
};
