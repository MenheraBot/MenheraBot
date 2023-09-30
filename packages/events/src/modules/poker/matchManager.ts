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
import { PokerMatch, PokerPlayer, TimerActionType } from './types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { distributeCards, getOpenedCards, getPokerCard } from './cardUtils';
import { getAvailableActions, getPlayerBySeat } from './playerControl';
import { getNextPlayableSeat } from './turnManager';
import starsRepository from '../../database/repositories/starsRepository';
import { clearPokerTimer, startPokerTimeout } from './timerManager';
import { millisToSeconds } from '../../utils/miscUtils';
import PokerFollowupInteractionContext from './PokerFollowupInteractionContext';
import { executeBlinds } from './executeBlinds';
import { DEFAULT_CHIPS, MAX_POKER_PLAYERS } from './constants';

const makeShowdown = async (
  ctx: ComponentInteractionContext | PokerFollowupInteractionContext,
  gameData: PokerMatch,
): Promise<void> => {
  gameData.stage = 'showdown';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userHands = gameData.players.reduce<any[]>((p, c) => {
    if (c.folded) return p;

    const cardsToUse = [
      ...c.cards.map((card) => getPokerCard(card).solverValue),
      ...getOpenedCards(gameData).map((card) => getPokerCard(card).solverValue),
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
    gameData,
    winners.map((a: { player: PokerPlayer }) => a.player),
    winReason,
  );
};

const getTableImage = async (gameData: PokerMatch) => {
  const parseUserToVangogh = (user: PokerPlayer) => ({
    avatar: user.avatar,
    name: user.name,
    chips: user.chips,
    fold: user.folded,
    cards: user.cards,
    backgroundTheme: user.backgroundTheme,
    cardTheme: user.cardTheme,
    won: gameData.winnerSeat.includes(user.seatId),
    seat: user.seatId,
    dealer: gameData.dealerSeat === user.seatId,
  });

  return vanGoghRequest(VanGoghEndpoints.PokerTable, {
    pot: gameData.pot,
    users: gameData.players.map(parseUserToVangogh),
    cards: getOpenedCards(gameData),
    showdown: gameData.stage === 'showdown',
  });
};

const finishRound = async (
  ctx: ComponentInteractionContext | PokerFollowupInteractionContext,
  gameData: PokerMatch,
  winners: PokerPlayer[],
  reason: string,
): Promise<void> => {
  const moneyForEach = Math.floor(gameData.pot / winners.length);
  gameData.inMatch = false;

  winners.forEach((player) => {
    player.chips += moneyForEach;
    gameData.winnerSeat.push(player.seatId);
  });

  const image = await getTableImage(gameData);

  for (let i = gameData.players.length - 1; i >= 0; i--) {
    const player = gameData.players[i];
    const shouldRemove = player.chips <= gameData.blind || player.willExit;

    if (shouldRemove) {
      pokerRepository.removeUsersInMatch([player.id]);
      if (player.chips > 0 && gameData.worthGame) starsRepository.addStars(player.id, player.chips);

      gameData.players.splice(i, 1);
    }
  }

  if (!gameData.players.some((a) => a.id === gameData.masterId))
    gameData.masterId = gameData.players[0].id;

  const canHaveOtherMatch = gameData.players.length > 1;

  const embed = createEmbed({
    title: 'Partida de Poker',
    color: gameData.embedColor,
    footer: canHaveOtherMatch
      ? { text: `Aguardando Jogadores: 0 / ${gameData.players.length}` }
      : undefined,
    image: image.err ? undefined : { url: 'attachment://poker.png' },
  });

  const nextMatch = createButton({
    label: 'Continuar jogando',
    style: ButtonStyles.Success,
    customId: createCustomId(2, 'N', ctx.commandId, gameData.matchId, 'AFTER_LOBBY', 'ENTER'),
  });

  const exitTable = createButton({
    label: 'Sair da Mesa',
    style: ButtonStyles.Secondary,
    customId: createCustomId(2, 'N', ctx.commandId, gameData.matchId, 'AFTER_LOBBY', 'LEAVE'),
  });

  const finishTable = createButton({
    label: 'Fechar mesa',
    style: ButtonStyles.Danger,
    customId: createCustomId(2, gameData.masterId, ctx.commandId, gameData.matchId, 'CLOSE_TABLE'),
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

  if (!canHaveOtherMatch) return closeTable(ctx, gameData, true);

  startPokerTimeout(`shutdown:${gameData.matchId}`, {
    executeAt: shutdownGame,
    type: TimerActionType.DELETE_GAME,
    matchId: gameData.matchId,
  });

  await pokerRepository.setMatchState(gameData.matchId, gameData);
};

const startFoldTimeout = (gameData: PokerMatch): void => {
  const player = getPlayerBySeat(gameData, gameData.seatToPlay);
  startPokerTimeout(`fold_timeout:${player.id}`, {
    executeAt: Date.now() + 1000 * 30,
    matchId: gameData.matchId,
    type: TimerActionType.TIMOEUT_FOLD,
  });
};

const clearFoldTimeout = (playerId: string): void => clearPokerTimer(`fold_timeout:${playerId}`);

const createTableMessage = async (
  ctx: InteractionContext | PokerFollowupInteractionContext,
  gameData: PokerMatch,
  lastActionMessage = '',
): Promise<void> => {
  const image = await getTableImage(gameData);

  const embed = createEmbed({
    title: 'Partida de Poker',
    color: gameData.embedColor,
    image: image.err ? undefined : { url: 'attachment://poker.png' },
  });

  const nextPlayer = getPlayerBySeat(gameData, gameData.seatToPlay).id;

  const seeCardsButton = createButton({
    label: 'Ver Cartas',
    style: ButtonStyles.Primary,
    customId: createCustomId(2, 'N', ctx.commandId, gameData.matchId, 'SEE_CARDS'),
  });

  const masterButton = createButton({
    label: 'Controles do Mestre',
    style: ButtonStyles.Secondary,
    customId: createCustomId(
      2,
      gameData.masterId,
      ctx.commandId,
      gameData.matchId,
      'ADMIN_CONTROL',
    ),
  });

  startFoldTimeout(gameData);

  await ctx.makeMessage({
    allowedMentions: { users: [BigInt(nextPlayer)] },
    embeds: [embed],
    file: image.err ? undefined : { name: 'poker.png', blob: image.data },
    attachments: [],
    components: [
      createActionRow([getAvailableActions(ctx, gameData)]),
      createActionRow([seeCardsButton, masterButton]),
    ],
    content: `${lastActionMessage}\n\n**O jogador ${mentionUser(
      nextPlayer,
    )} deve escolher sua ação**`,
  });
};

const startNextMatch = async (
  ctx: ComponentInteractionContext,
  gameData: PokerMatch,
): Promise<void> => {
  await ctx.ack();
  gameData.inMatch = true;
  clearPokerTimer(`shutdown:${gameData.matchId}`);

  gameData.players.forEach((player) => {
    player.pot = 0;
    player.folded = false;
  });

  gameData.pot = 0;
  gameData.raises = 0;
  gameData.stage = 'preflop';
  gameData.winnerSeat = [];
  gameData.interactionToken = ctx.interaction.token;

  gameData.dealerSeat = getNextPlayableSeat(gameData, gameData.dealerSeat);

  distributeCards(gameData);
  executeBlinds(gameData);

  await pokerRepository.setMatchState(gameData.matchId, gameData);
  await createTableMessage(ctx, gameData);
};

const setupGame = async (
  ctx: InteractionContext,
  players: string[],
  embedColor: number,
  chips: number,
): Promise<void> => {
  const blind = Math.floor((chips || DEFAULT_CHIPS) * 0.1);

  const playersData = await Promise.all(
    players.map(async (id, i) => {
      const discordUser = await cacheRepository.getDiscordUser(id, false);
      const userThemes = await userThemesRepository.getThemesForPoker(id);

      return {
        id,
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

const cleanupGame = (gameData: PokerMatch): void => {
  if (gameData.worthGame)
    gameData.players.forEach((a) => {
      starsRepository.addStars(a.id, a.chips);
    });

  pokerRepository.removeUsersInMatch(gameData.players.map((a) => a.id));
  pokerRepository.deleteMatchState(gameData.matchId);
};

const closeTable = async (
  ctx: ComponentInteractionContext | PokerFollowupInteractionContext,
  gameData: PokerMatch,
  followUp = false,
): Promise<void> => {
  const sorted = gameData.players.sort((a, b) => b.chips - a.chips);
  const winner = sorted[0];

  cleanupGame(gameData);

  const embed = createEmbed({
    title: 'Fim de Partida!',
    color: gameData.embedColor,
    thumbnail: { url: winner.avatar },
    description: `A partida de poker acabou! Parabéns para o vencedor **${mentionUser(
      winner.id,
    )}**\n\n**Top ${MAX_POKER_PLAYERS}**\n${sorted
      .map((a) => `1. ${mentionUser(a.id)} **${a.chips}** fichas!`)
      .join('\n')}`,
    footer: gameData.worthGame
      ? { text: 'Cada jogador recebeu o valor em estrelinhas de suas fichas' }
      : undefined,
  });

  ctx[followUp ? 'followUp' : 'makeMessage']({
    components: [],
    attachments: [],
    content: '',
    embeds: [embed],
  });
};

export {
  setupGame,
  createTableMessage,
  finishRound,
  cleanupGame,
  clearFoldTimeout,
  closeTable,
  startNextMatch,
  makeShowdown,
};
