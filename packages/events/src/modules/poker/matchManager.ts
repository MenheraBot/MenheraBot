import { ButtonStyles } from 'discordeno/types';
import cacheRepository from '../../database/repositories/cacheRepository';
import pokerRepository from '../../database/repositories/pokerRepository';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { InteractionContext } from '../../types/menhera';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';
import { shuffleCards } from '../blackjack';
import { PokerMatch, PokerPlayer } from './types';

const distributeCards = (match: PokerMatch): void => {
  const shuffledCards = shuffleCards();

  const getCards = <Cards extends 2 | 5>(
    cards: number[],
    length: Cards,
  ): Cards extends 2 ? [number, number] : [number, number, number, number, number] =>
    Array.from({ length }, () => cards.shift() ?? 0) as Cards extends 2
      ? [number, number]
      : [number, number, number, number, number];

  match.players.forEach((player) => {
    player.cards = getCards(shuffledCards, 2);
  });

  match.deck = getCards(shuffledCards, 5);
};

const getOpenedCards = (match: PokerMatch): number[] => {
  switch (match.stage) {
    case 'preflop':
      return [];
    case 'flop':
      return [match.deck[0], match.deck[1], match.deck[2]];
    case 'turn':
      return [match.deck[0], match.deck[1], match.deck[2], match.deck[3]];
    case 'river':
      return [match.deck[0], match.deck[1], match.deck[2], match.deck[3], match.deck[4]];
    default:
      return [];
  }
};

const createTableMessage = async (
  ctx: InteractionContext,
  match: PokerMatch,
  lastActionMessage = '',
): Promise<void> => {
  const parseUserToVangogh = (user: PokerPlayer) => ({
    avatar: user.avatar,
    name: user.name,
    chips: user.chips,
    fold: user.folded,
    theme: user.backgroundTheme,
    dealer: match.dealerSeat === user.seatId,
  });

  const image = await vanGoghRequest(VanGoghEndpoints.PokerTable, {
    pot: match.pot,
    users: match.players.map(parseUserToVangogh),
    cards: getOpenedCards(match),
  });

  const embed = createEmbed({
    title: 'Partida de Poker',
    color: match.embedColor,
    image: image.err ? undefined : { url: 'attachment://poker.png' },
  });

  const seeCardsButton = createButton({
    label: 'Ver Cartas',
    style: ButtonStyles.Primary,
    customId: createCustomId(2, 'N', ctx.commandId, match.matchId, 'SEE_CARDS'),
  });

  const nextPlayer = match.players.find((a) => a.seatId === match.seatToPlay)?.id ?? 0n;

  const makeActionButton = createButton({
    label: 'Apostar',
    style: ButtonStyles.Success,
    customId: createCustomId(2, nextPlayer, ctx.commandId, match.matchId, 'SHOW_ACTIONS'),
  });

  ctx.makeMessage({
    content: `${lastActionMessage}\n\n**O jogador ${mentionUser(
      nextPlayer,
    )} deve escolher sua ação**`,
    allowedMentions: { users: [BigInt(nextPlayer)] },
    embeds: [embed],
    file: image.err ? undefined : { name: 'poker.png', blob: image.data },
    attachments: [],
    components: [createActionRow([seeCardsButton, makeActionButton])],
  });
};

const setupGame = async (
  ctx: InteractionContext,
  players: string[],
  embedColor: number,
): Promise<void> => {
  const match: PokerMatch = {
    matchId: `${ctx.interaction.id}`,
    masterId: players[0],
    embedColor,
    players: await Promise.all(
      players.map(async (p, i) => {
        const discordUser = await cacheRepository.getDiscordUser(p, false);
        const userThemes = await userThemesRepository.getThemesForPoker(p);

        return {
          id: p,
          name: discordUser ? getDisplayName(discordUser, true) : '???',
          avatar: discordUser
            ? getUserAvatar(discordUser, { size: 128 })
            : 'https://cdn.menherabot.xyz/images/profiles/1.png',
          cardTheme: userThemes[0],
          backgroundTheme: userThemes[1],
          chips: i === 0 ? 3423 : 1000000,
          seatId: i,
          cards: [0, 0],
          folded: false,
          pot: 0,
        };
      }),
    ),
    deck: [0, 0, 0, 0, 0],
    stage: 'preflop',
    dealerSeat: 0,
    seatToPlay: 0,
    pot: 12332,
    lastAction: {
      action: 'CALL',
      playerSeat: 1,
      pot: 10,
    },
  };

  distributeCards(match);

  await pokerRepository.setPokerMatchState(ctx.interaction.id, match);
  await createTableMessage(ctx, match);
};

export { setupGame, createTableMessage };
