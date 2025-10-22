import { UpdateQuery } from 'mongoose';
import { bot } from '../index.js';
import userRepository from '../database/repositories/userRepository.js';
import { DatabaseUserSchema } from '../types/database.js';
import { debugError } from './debugError.js';
import { createEmbed } from './discord/embedUtils.js';
import { postTransaction } from './apiRequests/statistics.js';
import { ApiTransactionReason } from '../types/api.js';
import { calculateProbability } from './miscUtils.js';
import farmerRepository from '../database/repositories/farmerRepository.js';
import { addItems, getSiloLimits } from '../modules/fazendinha/siloUtils.js';
import { AvailableItems } from '../modules/fazendinha/types.js';
import { Items } from '../modules/fazendinha/constants.js';

const voteConstants = {
  baseRollAmount: 1,
  maxStarValue: 5_900,
  minStarValue: 1_200,
  rollWeekendMultiplier: 2,
  starWeekendMultiplier: 2,
  roll20Multiplier: 4,
  star20Multiplier: 4,
};

const fertilizerProbability = [
  { value: 0, probability: 60 },
  { value: 1, probability: 40 },
];

const weekendFertilizerProbability = [
  { value: 0, probability: 20 },
  { value: 1, probability: 80 },
];

const executeVoteWebhook = async (userId: string, isWeekend: boolean): Promise<void> => {
  const user = await userRepository.ensureFindUser(userId);

  // Simulates the new vote before adding it all prizes
  user.votes += 1;

  let rollQuantity = voteConstants.baseRollAmount;
  let starAmount =
    Math.floor(Math.random() * (voteConstants.maxStarValue - voteConstants.minStarValue + 1)) +
    voteConstants.minStarValue;

  let embedTitle = '🥰 | Obrigada por Votar amor | 🥰';
  let embedDescription = `Yahoiiii, brigada por votar em mim meu benzinho, como agradecimento, toma esse agradinho **${rollQuantity}**🔑, **${starAmount}**⭐!\n\nSabia que a cada 20 votos você ganha um prêmio especial? E que você ja votou **${user.votes}** vezes em mim? Obrigada meu benzinho`;

  if (isWeekend) {
    rollQuantity *= voteConstants.rollWeekendMultiplier;
    starAmount *= voteConstants.starWeekendMultiplier;
    embedTitle = '💖 | Final de Semana | 💖';
    embedDescription = `UOOO, tu votou em mim no final de semana, eu te agradeço muuuito por tirar um tempinho do seu final de semana para me ajudar. Vou até dar um prêmio especial pra ti por isso: **${rollQuantity}**🔑, **${starAmount}**⭐\n\nTu já votou **${user.votes}** vezes em mim? Obrigada luz da Minha Escuridão`;
  }

  if (user.votes !== 0) {
    if (user.votes % 20 === 0) {
      rollQuantity *= voteConstants.roll20Multiplier;
      starAmount *= voteConstants.star20Multiplier;
      embedTitle = '🎉 | Prêmio Especial | 🎉';
      embedDescription = `Yyyayyyyy, você atingiu a meta do prêmio especial de 20 votos! Eu agradeço demais por você se dedicar tanto à me ajudar, você vai ganhar muuuito mais hoje. Obrigada novamente por me ajudar, e não se esqueça que a cada 12 horas você pode me ajudar mais\n\nVocê votou ${user.votes} vezes em mim, e por isso, ganhou o **QUADRUPLO** de prêmios! Toma-te ${starAmount}⭐, **${rollQuantity}**🔑\n\nVote em mim novamente em 12 horas 🎊`;
    }

    if (user.votes % 20 === 0 && isWeekend) {
      embedTitle = '💜 | CARAAAA, TU CONSEGUIU O MÁXIMO DE PRÊMIOS | 💜';
      embedDescription = `É ISSO! VOCÊ CONSEGUIU! Além de dar um tempinho do seu final de semana para me ajudar, você atingiu a meta de 20 votos! Isso significa o que? Exatamente, MUUUUITOS PRÊMIOS.\nVocê recebeu **${starAmount}** :star: , **${rollQuantity}** 🔑.\nVocê pode votar a cada 12 horas,  e além de me ajudar, tu ganha prêmios por isso. Obrigada de verdade por tudo amorzinho, com isso, tu já votou ${user.votes} vezes em mim, tu é simplesmente incrível`;
    }
  }

  const updateData: UpdateQuery<DatabaseUserSchema> = {
    $inc: {
      votes: 1,
      rolls: rollQuantity,
      estrelinhas: starAmount,
    },
    $set: {
      voteCooldown: Date.now() + 43200000,
    },
  };

  await userRepository.updateUserWithSpecialData(userId, updateData);

  await postTransaction(
    `${bot.id}`,
    `${userId}`,
    starAmount,
    'estrelinhas',
    ApiTransactionReason.VOTE_THANK,
  );

  const droppedItem = calculateProbability(
    isWeekend ? weekendFertilizerProbability : fertilizerProbability,
  );

  if (droppedItem !== 0) {
    const farmer = await farmerRepository.getFarmer(userId);

    const siloLimit = getSiloLimits(farmer);

    const canGetItem = siloLimit.limit - siloLimit.used >= 1;

    if (canGetItem) {
      const newItems = addItems(farmer.items, [{ id: AvailableItems.Fertilizer, amount: 1 }]);

      await farmerRepository.updateItems(userId, newItems);
    }

    embedDescription += canGetItem
      ? `\n\nVocê também ganhou 1x ${
          Items[AvailableItems.Fertilizer].emoji
        } Fertilizante! Use em sua fazendinha com /fazendinha administrar campos`
      : `\n\nVocê poderia ter ganhado 1x ${
          Items[AvailableItems.Fertilizer].emoji
        } Fertilizante, mas infelizmente você não tem espaço em seu silo!`;
  }

  const embed = createEmbed({
    title: embedTitle,
    description: embedDescription,
    color: 0x7e40e9,
    image: { url: 'https://i.imgur.com/5XaGRDu.jpg' },
    thumbnail: { url: 'https://i.imgur.com/qtM9T9C.jpg' },
  });

  const userDM = await bot.helpers.getDmChannel(userId).catch(debugError);

  if (userDM) bot.helpers.sendMessage(userDM.id, { embeds: [embed] }).catch((e) => debugError(e));
};

export { executeVoteWebhook };
