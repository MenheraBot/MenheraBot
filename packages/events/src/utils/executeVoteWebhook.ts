import { UpdateQuery } from 'mongoose';
import { DiscordEmbedField } from 'discordeno/types';
import { bot } from '..';
import userRepository from '../database/repositories/userRepository';
import { DatabaseUserSchema } from '../types/database';
import { debugError } from './debugError';
import { createEmbed } from './discord/embedUtils';
import { postTransaction } from './apiRequests/statistics';
import { ApiTransactionReason } from '../types/api';
import { logger } from './logger';
import giveRepository from '../database/repositories/giveRepository';

const voteConstants = {
  baseRollAmount: 1,
  maxStarValue: 5_900,
  minStarValue: 1_200,
  rollWeekendMultiplier: 2,
  starWeekendMultiplier: 2,
  roll20Multiplier: 4,
  star20Multiplier: 4,
};

const executeVoteWebhook = async (userId: string, isWeekend: boolean): Promise<void> => {
  const user = await userRepository.ensureFindUser(userId);

  logger.logSwitch(bot, 'User found in vote webhook', user);

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

  logger.logSwitch(bot, 'After calculations');

  const today = new Date();

  const [day, month, year] = [today.getDate(), today.getUTCMonth(), today.getFullYear()];

  const fields: DiscordEmbedField[] = [];

  if (`${day}/${month}/${year}` === `7/4/2024` && !user.badges.some((a) => a.id === 27)) {
    await giveRepository.giveBadgeToUser(userId, 27);

    fields.push({
      name: '🎉 | Presente de aniversário',
      value:
        'Obrigada por votar em mim no dia de meu aniversário! Esse presente é muito especial para mim...\nQuero te agradecer por estar comigo durante todo esse tempo. Adicionei uma badge em seu perfil. Da uma olhadinha ;)',
    });
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

  logger.logSwitch(bot, 'After Special data');

  await postTransaction(
    `${bot.id}`,
    `${userId}`,
    starAmount,
    'estrelinhas',
    ApiTransactionReason.VOTE_THANK,
  );

  logger.logSwitch(bot, 'After transaction');

  const embed = createEmbed({
    title: embedTitle,
    description: embedDescription,
    color: 0x7e40e9,
    image: { url: 'https://i.imgur.com/5XaGRDu.jpg' },
    fields,
    thumbnail: { url: 'https://i.imgur.com/qtM9T9C.jpg' },
  });

  const userDM = await bot.helpers.getDmChannel(userId).catch(debugError);

  logger.logSwitch(bot, 'After getting user dm ID: ', userDM?.id);

  if (userDM) bot.helpers.sendMessage(userDM.id, { embeds: [embed] }).catch((e) => debugError(e));

  logger.logSwitch(bot, 'After sending user DM');

  if (bot.prodLogSwitch) {
    const afterAllUser = await userRepository.ensureFindUser(userId);

    logger.logSwitch(bot, 'the user after all', afterAllUser);
  }
};

export { executeVoteWebhook };
