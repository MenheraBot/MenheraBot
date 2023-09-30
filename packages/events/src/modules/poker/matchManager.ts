/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonStyles } from 'discordeno/types';
import PokerSolver from 'pokersolver';
import cacheRepository from '../../database/repositories/cacheRepository';
import pokerRepository from '../../database/repositories/pokerRepository';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { InteractionContext } from '../../types/menhera';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';
import { shuffleCards } from '../blackjack';
import { PokerMatch, PokerPlayer, TimerActionType } from './types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { getPokerCard } from './cardUtils';
import { getAvailableActions } from './playerControl';
import { closeTable, getNextPlayableSeat } from './handleGameAction';
import starsRepository from '../../database/repositories/starsRepository';
import { clearPokerTimer, startPokerTimeout } from './timerManager';
import { millisToSeconds } from '../../utils/miscUtils';
import PokerFollowupInteractionContext from './PokerFollowupInteractionContext';

const MAX_POKER_PLAYERS = 8;
const DEFAULT_CHIPS = 50_000;

const distributeCards = (match: PokerMatch): void => {
  const shuffledCards = shuffleCards();

  const getCards = <Cards extends 2 | 5>(
    cards: number[],
    length: Cards,
  ): Cards extends 2 ? [number, number] : [number, number, number, number, number] =>
    Array.from({ length }, () => cards.shift()) as Cards extends 2
      ? [number, number]
      : [number, number, number, number, number];

  for (let i = 0; i <= 1; i++) {
    match.players.forEach((player) => {
      const card = shuffledCards.shift()!;
      player.cards[i] = card;
    });
  }

  match.communityCards = getCards(shuffledCards, 5);
};

const executeBlinds = (match: PokerMatch): void => {
  const headsUp = match.players.length === 2;
  const { blind } = match;
  const halfBlind = Math.floor(blind / 2);

  if (headsUp) {
    const dealerIndex = match.players.findIndex((a) => a.seatId === match.dealerSeat);
    const dealer = match.players[dealerIndex];
    const bigBlind = match.players[Number(!dealerIndex)];

    bigBlind.pot = blind;
    bigBlind.chips -= blind;

    dealer.pot = halfBlind;
    dealer.chips -= halfBlind;

    match.pot = blind + halfBlind;
    match.lastAction = {
      action: 'BET',
      playerSeat: bigBlind.seatId,
      pot: bigBlind.pot,
    };

    match.seatToPlay = dealer.seatId;
    match.lastPlayerSeat = bigBlind.seatId;
    return;
  }

  const smallBlindSeat = getNextPlayableSeat(match, match.dealerSeat);
  const bigBlindSeat = getNextPlayableSeat(match, smallBlindSeat);

  const smallBlind = match.players.find((a) => a.seatId === smallBlindSeat)!;
  const bigBlind = match.players.find((a) => a.seatId === bigBlindSeat)!;

  smallBlind.pot = halfBlind;
  smallBlind.chips -= halfBlind;

  bigBlind.pot = blind;
  bigBlind.chips -= blind;

  match.pot = blind + halfBlind;
  match.lastAction = {
    action: 'BET',
    playerSeat: bigBlind.seatId,
    pot: bigBlind.pot,
  };

  match.seatToPlay = getNextPlayableSeat(match, bigBlindSeat);
  match.lastPlayerSeat = bigBlindSeat;
};

const changeStage = (match: PokerMatch): void => {
  const stages: { [x: string]: PokerMatch['stage'] } = {
    preflop: 'flop',
    flop: 'turn',
    turn: 'river',
    river: 'showdown',
  };
  match.raises = 0;

  match.stage = stages[match.stage];
};

const getOpenedCards = (match: PokerMatch): number[] => {
  switch (match.stage) {
    case 'preflop':
      return [];
    case 'flop':
      return [match.communityCards[0], match.communityCards[1], match.communityCards[2]];
    case 'turn':
      return [
        match.communityCards[0],
        match.communityCards[1],
        match.communityCards[2],
        match.communityCards[3],
      ];
    case 'river':
    case 'showdown':
      return [
        match.communityCards[0],
        match.communityCards[1],
        match.communityCards[2],
        match.communityCards[3],
        match.communityCards[4],
      ];
    default:
      return [];
  }
};

const makeShowdown = async (
  ctx: ComponentInteractionContext | PokerFollowupInteractionContext,
  match: PokerMatch,
): Promise<void> => {
  match.stage = 'showdown';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userHands = match.players.reduce<any[]>((p, c) => {
    if (c.folded) return p;

    const cardsToUse = [
      ...c.cards.map((card) => getPokerCard(card).solverValue),
      ...getOpenedCards(match).map((card) => getPokerCard(card).solverValue),
    ];

    const hand = PokerSolver.Hand.solve(cardsToUse);
    hand.player = c;

    p.push(hand);
    return p;
  }, []);

  const winners = PokerSolver.Hand.winners(userHands);

  const winReason = winners[0].descr.includes('Royal Flush')
    ? 'STRAIGHT-FLUSH-ROYAL'
    : winners[0].name.replace(' ', '-').toUpperCase();

  finishRound(
    ctx,
    match,
    winners.map((a: { player: PokerPlayer }) => a.player),
    winReason,
  );
};

const getTableImage = async (match: PokerMatch) => {
  const parseUserToVangogh = (user: PokerPlayer) => ({
    avatar: user.avatar,
    name: user.name,
    chips: user.chips,
    fold: user.folded,
    cards: user.cards,
    backgroundTheme: user.backgroundTheme,
    cardTheme: user.cardTheme,
    won: match.winnerSeat.includes(user.seatId),
    seat: user.seatId,
    dealer: match.dealerSeat === user.seatId,
  });

  return vanGoghRequest(VanGoghEndpoints.PokerTable, {
    pot: match.pot,
    users: match.players.map(parseUserToVangogh),
    cards: getOpenedCards(match),
    showdown: match.stage === 'showdown',
  });
};

const finishRound = async (
  ctx: ComponentInteractionContext | PokerFollowupInteractionContext,
  match: PokerMatch,
  winners: PokerPlayer[],
  reason: string,
): Promise<void> => {
  const moneyForEach = Math.floor(match.pot / winners.length);
  match.inMatch = false;

  winners.forEach((player) => {
    player.chips += moneyForEach;
    match.winnerSeat.push(player.seatId);
  });

  const image = await getTableImage(match);

  for (let i = match.players.length - 1; i >= 0; i--) {
    const player = match.players[i];
    const shouldRemove = player.chips <= match.blind || player.willExit;

    if (shouldRemove) {
      pokerRepository.removeUsersInMatch([player.id]);
      if (player.chips > 0 && match.worthGame) starsRepository.addStars(player.id, player.chips);

      match.players.splice(i, 1);
    }
  }

  if (!match.players.some((a) => a.id === match.masterId)) match.masterId = match.players[0].id;

  const canHaveOtherMatch = match.players.length > 1;

  const embed = createEmbed({
    title: 'Partida de Poker',
    color: match.embedColor,
    footer: canHaveOtherMatch
      ? { text: `Aguardando Jogadores: 0 / ${match.players.length}` }
      : undefined,
    image: image.err ? undefined : { url: 'attachment://poker.png' },
  });

  const nextMatch = createButton({
    label: 'Continuar jogando',
    style: ButtonStyles.Success,
    customId: createCustomId(2, 'N', ctx.commandId, match.matchId, 'AFTER_LOBBY', 'ENTER'),
  });

  const exitTable = createButton({
    label: 'Sair da Mesa',
    style: ButtonStyles.Secondary,
    customId: createCustomId(2, 'N', ctx.commandId, match.matchId, 'AFTER_LOBBY', 'LEAVE'),
  });

  const finishTable = createButton({
    label: 'Fechar mesa',
    style: ButtonStyles.Danger,
    customId: createCustomId(2, match.masterId, ctx.commandId, match.matchId, 'CLOSE_TABLE'),
  });

  const shutdownGame = Date.now() + 1000 * 60 * 2;

  await ctx.makeMessage({
    embeds: [embed],
    attachments: [],
    file: image.err ? undefined : { name: 'poker.png', blob: image.data },
    components: canHaveOtherMatch ? [createActionRow([finishTable, exitTable, nextMatch])] : [],
    allowedMentions: { users: winners.map((a) => BigInt(a.id)) },
    content: `${winners
      .map((a) => mentionUser(a.id))
      .join(
        ', ',
      )} venceu essa rodada! Um total de **${moneyForEach}** fichas diretamente para seu bolso!\nMotivo: ${reason}\n\nA partida vai acabar em <t:${millisToSeconds(
      shutdownGame,
    )}:R>`,
  });

  if (!canHaveOtherMatch) return closeTable(ctx, match, true);

  startPokerTimeout(`shutdown:${match.matchId}`, {
    executeAt: shutdownGame,
    type: TimerActionType.DELETE_GAME,
    matchId: match.matchId,
  });

  await pokerRepository.setMatchState(match.matchId, match);
};

const startFoldTimeout = (match: PokerMatch): void => {
  const player = match.players.find((a) => a.seatId === match.seatToPlay)!;
  startPokerTimeout(`fold_timeout:${player.id}`, {
    executeAt: Date.now() + 1000 * 30,
    matchId: match.matchId,
    type: TimerActionType.TIMOEUT_FOLD,
  });
};

const clearFoldTimeout = (playerId: string): void => clearPokerTimer(`fold_timeout:${playerId}`);

const createTableMessage = async (
  ctx: InteractionContext | PokerFollowupInteractionContext,
  match: PokerMatch,
  lastActionMessage = '',
): Promise<void> => {
  const image = await getTableImage(match);

  const embed = createEmbed({
    title: 'Partida de Poker',
    color: match.embedColor,
    image: image.err ? undefined : { url: 'attachment://poker.png' },
  });

  const nextPlayer = match.players.find((a) => a.seatId === match.seatToPlay)?.id ?? 0n;

  const seeCardsButton = createButton({
    label: 'Ver Cartas',
    style: ButtonStyles.Primary,
    customId: createCustomId(2, 'N', ctx.commandId, match.matchId, 'SEE_CARDS'),
  });

  const masterButton = createButton({
    label: 'Controles do Mestre',
    style: ButtonStyles.Secondary,
    customId: createCustomId(2, match.masterId, ctx.commandId, match.matchId, 'ADMIN_CONTROL'),
  });

  startFoldTimeout(match);

  await ctx.makeMessage({
    allowedMentions: { users: [BigInt(nextPlayer)] },
    embeds: [embed],
    file: image.err ? undefined : { name: 'poker.png', blob: image.data },
    attachments: [],
    components: [
      createActionRow([getAvailableActions(ctx, match)]),
      createActionRow([seeCardsButton, masterButton]),
    ],
    content: `${lastActionMessage}\n\n**O jogador ${mentionUser(
      nextPlayer,
    )} deve escolher sua ação**`,
  });
};

const setupGame = async (
  ctx: InteractionContext,
  players: string[],
  embedColor: number,
  chips: number,
): Promise<void> => {
  const blind = Math.floor((chips || DEFAULT_CHIPS) * 0.1);

  const playersData = await Promise.all(
    players.map(async (p, i) => {
      const discordUser = await cacheRepository.getDiscordUser(p, false);
      const userThemes = await userThemesRepository.getThemesForPoker(p);

      return {
        id: p,
        willExit: false,
        name: discordUser ? getDisplayName(discordUser, true) : '???',
        avatar: discordUser
          ? getUserAvatar(discordUser, { size: 128 })
          : 'https://cdn.menherabot.xyz/images/profiles/1.png',
        cardTheme: userThemes[0],
        backgroundTheme: userThemes[1],
        chips: chips || DEFAULT_CHIPS,
        seatId: i,
        cards: [0, 0] as [number, number],
        folded: false,
        pot: 0,
      };
    }),
  );

  const match: PokerMatch = {
    matchId: `${ctx.interaction.id}`,
    masterId: players[0],
    embedColor,
    worthGame: chips > 0,
    players: playersData,
    communityCards: [0, 0, 0, 0, 0],
    stage: 'preflop',
    interactionToken: ctx.interaction.token,
    dealerSeat: 0,
    blind,
    inMatch: true,
    raises: 0,
    winnerSeat: [],
    lastPlayerSeat: 0,
    seatToPlay: 0,
    pot: 0,
    lastAction: {
      action: 'CHECK',
      playerSeat: 0,
      pot: 0,
    },
  };

  distributeCards(match);
  executeBlinds(match);

  await pokerRepository.setMatchState(ctx.interaction.id, match);
  await createTableMessage(ctx, match);
};

export {
  setupGame,
  createTableMessage,
  finishRound,
  changeStage,
  clearFoldTimeout,
  MAX_POKER_PLAYERS,
  makeShowdown,
  executeBlinds,
  distributeCards,
};
