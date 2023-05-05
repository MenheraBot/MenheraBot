import Router from 'koa-router';
import { UpdateQuery } from 'mongoose';
import { bot } from '../../../index';
import userRepository from '../../../database/repositories/userRepository';
import { debugError } from '../../../utils/debugError';
import { createEmbed } from '../../../utils/discord/embedUtils';
import { getEnviroments } from '../../../utils/getEnviroments';
import { DatabaseUserSchema } from '../../../types/database';

const voteConstants = {
  baseRollAmount: 2,
  maxStarValue: 12_300,
  minStarValue: 4_800,
  rollWeekendMultiplier: 3,
  starWeekendMultiplier: 3,
  roll20Multiplier: 5,
  star20Multiplier: 5,
};

const handleRequest = async (userId: string, isWeekend: boolean): Promise<void> => {
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

  embedTitle = '🥳 Evento de Aniversário';
  embedDescription = `Você recebeu MUITO mais prêmios pois estamos comemorando **MEUS 3 ANOS DE VIDA**. Isso mesmo, eu estou de anivesrário, portanto as coisas estão especiais!!!\nVocê recebeu **${starAmount}** :star: , **${rollQuantity}** 🔑.\nVocê pode votar a cada 12 horas,  e além de me ajudar, tu ganha prêmios por isso. Obrigada de verdade por tudo amorzinho, com isso, tu já votou ${user.votes} vezes em mim, tu é simplesmente incrível`;

  const embed = createEmbed({
    title: embedTitle,
    description: embedDescription,
    color: 0x7e40e9,
    image: { url: 'https://i.imgur.com/UMnJW64.png' },
    thumbnail: { url: 'https://i.imgur.com/qtM9T9C.jpg' },
  });

  const userDM = await bot.helpers.getDmChannel(userId).catch(debugError);

  if (userDM) bot.helpers.sendMessage(userDM.id, { embeds: [embed] }).catch(debugError);

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

  if (user.votes >= 100 && !user.badges.some((a) => a.id === 9))
    updateData.$push = { badges: { id: 9, obtainAt: `${Date.now()}` } };

  await userRepository.updateUserWithSpecialData(userId, updateData);
};

const createVoteWebhookRouter = (): Router => {
  const router = new Router();

  const { DBL_TOKEN } = getEnviroments(['DBL_TOKEN']);

  router.post('/webhook', (ctx) => {
    if (!ctx.req.headers.authorization || ctx.req.headers.authorization !== DBL_TOKEN)
      return ctx.throw(401, 'You are not allowed to access that!');

    const { user, isWeekend, type } = ctx.request.body;

    ctx.status = 200;

    if (type === 'test') return;

    handleRequest(user, isWeekend);
  });

  return router;
};

export { createVoteWebhookRouter };
