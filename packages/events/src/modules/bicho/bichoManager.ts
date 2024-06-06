import { BigString } from 'discordeno/types';
import bichoRepository from '../../database/repositories/bichoRepository';
import { postBichoResults, postTransaction } from '../../utils/apiRequests/statistics';
import starsRepository from '../../database/repositories/starsRepository';
import { BichoBetType, BichoGameInfo } from './types';
import { getBetType, makePlayerResults, mapResultToAnimal } from './finishBets';
import { createEmbed } from '../../utils/discord/embedUtils';
import { COLORS } from '../../structures/constants';
import { bot } from '../..';
import { getEnviroments } from '../../utils/getEnviroments';
import { debugError } from '../../utils/debugError';
import { capitalize } from '../../utils/miscUtils';
import { ApiTransactionReason } from '../../types/api';
import { resolveSeparatedStrings } from '../../utils/discord/componentUtils';
import notificationRepository from '../../database/repositories/notificationRepository';
import executeDailies from '../dailies/executeDailies';
import userRepository from '../../database/repositories/userRepository';

const GAME_DURATION = 1000 * 60 * 60 * 5;

const generateResults = (): number[] => {
  const results = [];

  for (let i = 0; i < 4; i++) results.push(Math.floor(Math.random() * 10));

  return results;
};

const { BICHO_WEBHOOK_ID, BICHO_WEBHOOK_TOKEN } = getEnviroments([
  'BICHO_WEBHOOK_ID',
  'BICHO_WEBHOOK_TOKEN',
]);

const finishGame = async (): Promise<void> => {
  const results = [
    generateResults(),
    generateResults(),
    generateResults(),
    generateResults(),
    generateResults(),
  ];

  const playerBets = await bichoRepository.getAllUserBets();

  const players = makePlayerResults(playerBets, results);

  postBichoResults(players, Date.now(), JSON.stringify(results));

  players.forEach(async (a) => {
    if (a.didWin) {
      const userData = await userRepository.ensureFindUser(a.id);
      await executeDailies.winBet(userData, 'bicho');
      await executeDailies.winStarsInBet(userData, a.profit);
      await starsRepository.addStars(a.id, a.profit);
      await postTransaction(
        `${bot.id}`,
        `${a.id}`,
        a.profit,
        'estrelinhas',
        ApiTransactionReason.WIN_BICHO,
      );
      await notificationRepository.createNotification(
        a.id,
        'commands:notificações.notifications.user-won-bicho',
        {
          stars: a.profit,
        },
      );
    }
  });

  const wonPlayers = players.filter((a) => a.didWin);

  const biggestProfit = players.reduce((p, c) => (c.profit > p && c.didWin ? c.profit : p), 0);

  const resultsEmbed = createEmbed({
    title: 'Resultados do Jogo do Bicho',
    timestamp: Date.now(),
    color: COLORS.Random(),
    description: `\`\`\`js\n1°) ${results[0]} (${capitalize(mapResultToAnimal(results[0]))})\n2°) ${
      results[1]
    } (${capitalize(mapResultToAnimal(results[1]))})\n3°) ${results[2]} (${capitalize(
      mapResultToAnimal(results[2]),
    )})\n4°) ${results[3]} (${capitalize(mapResultToAnimal(results[3]))})\n5°) ${
      results[4]
    } (${capitalize(mapResultToAnimal(results[4]))})\`\`\`\n**Jogadores:** ${
      players.length
    }\n**Maior Lucro:** ${biggestProfit} :star:\n**Vencedores**: ${wonPlayers.length}\n\`\`\`js\n${
      wonPlayers.length === 0
        ? 'Ninguém Ganhou'
        : wonPlayers.map(
            (player) =>
              `[${player.id}]\n• Apostou ${player.bet}\n• Ganhou ${
                player.profit
              }\n• Escolha: ${(() => {
                const playerBet = playerBets.find((a) => a.id === player.id)?.option ?? '0';

                return optionBetToText(playerBet, getBetType(playerBet));
              })()}\n------------\n`,
          )
    }\`\`\``,
  });

  await bot.helpers
    .sendWebhookMessage(BigInt(BICHO_WEBHOOK_ID), BICHO_WEBHOOK_TOKEN, {
      embeds: [resultsEmbed],
    })
    .catch(debugError);

  await bichoRepository.setLastGameInfo(Date.now(), results, biggestProfit);
  await bichoRepository.resetAllCurrentBichoStats();
  await startGameLoop();
};

const didUserAlreadyBet = async (userId: BigString): Promise<boolean> =>
  bichoRepository.didUserAlreadyBet(userId);

const optionBetToText = (option: string, type: BichoBetType): string => {
  switch (type) {
    case 'unity':
    case 'ten':
    case 'hundred':
    case 'thousand':
      return option;

    case 'animal':
      return capitalize(option);

    case 'sequence':
      return resolveSeparatedStrings(option)
        .map((text, i) => `${i + 1}° ${capitalize(text)}`)
        .join('. ');

    case 'corner':
      return resolveSeparatedStrings(option).map(capitalize).join(', ');
  }
};

const canRegisterBet = async (userId: BigString): Promise<boolean> => {
  const [dueDate, haveBet] = await Promise.all([
    bichoRepository.getCurrentGameDueDate(),
    didUserAlreadyBet(userId),
  ]);

  if (dueDate < Date.now()) return false;
  if (haveBet) return false;

  return true;
};

const registerUserBet = async (
  userId: BigString,
  betValue: number,
  optionSelected: string,
): Promise<void> => {
  await bichoRepository.addUserBet(userId, betValue, optionSelected);
  await bichoRepository.incrementBetAmount(betValue);
};

const startGameLoop = async (): Promise<void> => {
  let hasDueDate = await bichoRepository.getCurrentGameDueDate();

  if (hasDueDate < Date.now()) {
    const pendingAwards = await bichoRepository.getCurrentGameBetsMade();

    if (pendingAwards > 0) return finishGame();
    hasDueDate = Date.now() + GAME_DURATION;
    bichoRepository.setCurrentGameDueDate(hasDueDate);
  }

  setTimeout(finishGame, hasDueDate - Date.now()).unref();
};

const getLastGameStatus = async (): Promise<BichoGameInfo | null> =>
  bichoRepository.getLastGameInfo();

const getCurrentGameStatus = async (): Promise<{
  dueDate: number;
  betsOn: number;
  usersIn: number;
}> => {
  const [dueDate, betsOn, usersIn] = await Promise.all([
    bichoRepository.getCurrentGameDueDate(),
    bichoRepository.getCurrentBichoBetAmount(),
    bichoRepository.getCurrentGameBetsMade(),
  ]);

  return { dueDate, betsOn, usersIn };
};

export {
  canRegisterBet,
  optionBetToText,
  finishGame,
  GAME_DURATION,
  registerUserBet,
  getLastGameStatus,
  getCurrentGameStatus,
  didUserAlreadyBet,
  startGameLoop,
};
