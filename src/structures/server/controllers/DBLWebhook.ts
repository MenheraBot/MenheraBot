import Router from 'koa-router';
import MenheraClient from 'MenheraClient';

import { votes as constants } from '@structures/MenheraConstants';
import { MessageEmbed } from 'discord.js-light';

const runVote = async (
  client: MenheraClient,
  userId: string,
  isWeekend: boolean,
): Promise<void> => {
  const user = await client.repositories.userRepository.find(userId);
  if (!user) return;

  user.votos += 1;

  let { rollQuantity } = constants;
  let starQuantity =
    Math.floor(Math.random() * (constants.maxStarValue - constants.minStarValue + 1)) +
    constants.minStarValue;
  let embedTitle = '🥰 | Obrigada por Votar amor | 🥰';
  let embedDescription = `Yahoiiii, brigada por votar em mim meu benzinho, como agradecimento, toma esse agradinho **${rollQuantity}**🔑, **${starQuantity}**⭐!\n\nSabia que a cada 20 votos você ganha um prêmio especial? E que você ja votou **${user.votos}** vezes em mim? Obrigada meu benzinho`;

  if (isWeekend) {
    rollQuantity *= constants.rollWeekendMultiplier;
    starQuantity *= constants.starWeekendMultiplier;
    embedTitle = '💖 | Final de Semana | 💖';
    embedDescription = `UOOO, tu votou em mim no final de semana, eu te agradeço muuuito por tirar um tempinho do seu final de semana para me ajudar. Vou até dar um prêmio especial pra ti por isso: **${rollQuantity}**🔑, **${starQuantity}**⭐`;
  }

  if (user.votos % 20 === 0) {
    rollQuantity *= constants.roll20Multiplier;
    starQuantity *= constants.star20Multiplier;
    embedTitle = '🎉 | Prêmio Especial | 🎉';
    embedDescription = `Yyyayyyyy, você atingiu a meta do prêmio especial de 20 votos! Eu agradeço demais por você se dedicar tanto à me ajudar, você vai ganhar muuuito mais hoje. Obrigada novamente por me ajudar, e não se esqueça que a cada 12 horas você pode me ajudar mais\n\nVocê votou ${user.votos} vezes em mim, e por isso, ganhou o **QUADRUPLO** de prêmios! Toma-te ${starQuantity}⭐, **${rollQuantity}**🔑\n\nVote em mim novamente em 12 horas 🎊`;
  }

  if (user.votos % 20 === 0 && isWeekend) {
    embedTitle = '💜 | CARAAAA, TU COSNEGUIU O MÁXIMO DE PRÊMIOS | 💜';
    embedDescription = `É ISSO! VOCÊ CONSEGUIU! Além de dar um tempinho do seu final de semana para me ajudar, você atingiu a meta de 20 votos! Isso significa o que? Exatamente, MUUUUITOS PRÊMIOS.\nVocê recebeu **${starQuantity}** :star: , **${rollQuantity}** 🔑.\nVocê pode votar a cada 12 horas, e além de me ajudar, tu ganha prêmios por isso. Obrigada de verdade por tudo amorzinho`;
  }

  const embed = new MessageEmbed()
    .setTitle(embedTitle)
    .setColor('#7e40e9')
    .setImage('https://i.imgur.com/5XaGRDu.jpg')
    .setThumbnail('https://i.imgur.com/qtM9T9C.jpg')
    .setDescription(embedDescription);

  user.rolls += rollQuantity;
  user.estrelinhas += starQuantity;
  user.voteCooldown = `${Date.now() + 43200000}`;
  await user.save();

  const sendMessageToUser = async (id: string, embedToSend: MessageEmbed) => {
    const userInShard = client.users.forge(id);
    await userInShard.send({ embeds: [embedToSend] }).catch(() => null);
  };

  sendMessageToUser(userId, embed).catch(() => null);
};

export default (client: MenheraClient): Router => {
  const router = new Router();

  router.post('/webhook', async (ctx) => {
    if (!ctx.req.headers.authorization || ctx.req.headers.authorization !== process.env.DBL_AUTH)
      return ctx.throw(401, 'You are not allowed to access that');

    const { user, isWeekend, type } = ctx.request.body;

    if (type === 'test') {
      ctx.status = 200;
      return;
    }

    runVote(client, user, isWeekend);

    ctx.status = 200;
  });

  return router;
};
