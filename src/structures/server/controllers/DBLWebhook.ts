import Router from 'koa-router';
import MenheraClient from 'MenheraClient';

import { votes as constants } from '@structures/Constants';
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
  let embedTitle = '<:God:758474639570894899> | Obrigada por votar em mim';
  let embedDescription = `Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nComo forma de agradecimento, você recebeu **1**🔑 e **${starQuantity}**⭐!\n\nSabia que a cada 20 votos você ganha um prêmio especial? E que você ja votou **${user.votos}** vezes em mim? **OBRIGADA**\n\nVote em mim novamente em 12 horas <a:MenheraChibiTableSlam:768621225143697459>`;

  if (isWeekend) {
    rollQuantity *= constants.rollWeekendMultiplier;
    starQuantity *= constants.starWeekendMultiplier;
    embedTitle = '<:Angel:758765044204437535> | OWO VOCÊ RECEBEU UM PRÊMIO ESPECIAL!!!';
    embedDescription = `Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nComo forma de agradecimento, você recebeu **${rollQuantity}**🔑 e **${starQuantity}**⭐! Você está com **${user.votos}** votos\n\nPor hoje ser final de semana, você recebeu o DOBRO dos premios`;
  }

  if (user.votos % 20 === 0) {
    rollQuantity *= constants.roll20Multiplier;
    starQuantity *= constants.star20Multiplier;
    embedTitle = '<:Angel:758765044204437535> | OWO VOCÊ RECEBEU UM PRÊMIO ESPECIAL!!!';
    embedDescription = `Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nVocê votou ${user.votos} vezes em mim, e por isso, ganhou o **QUADRUPLO** de prêmios! Toma-te ${starQuantity}⭐ e **${rollQuantity}**🔑 \n\nVote em mim novamente em 12 horas <a:MenheraChibiTableSlam:768621225143697459>`;
  }

  if (user.votos % 20 === 0 && isWeekend) {
    embedTitle = 'O MÁXIMO DE PRÊMIOS MLKK';
    embedDescription = `MANOOOOO TU CONSEGUIU O MÁXIMO DE PRÊMIOS!!!!\nPor hoje ser final de semana, e este voto seu é múltiplo de 20, você recebeu 6x mais prêmios!\nVocê recebeu **${starQuantity}** :star: e **${rollQuantity}** 🔑`;
  }

  const embed = new MessageEmbed()
    .setTitle(embedTitle)
    .setColor('#fa73e5')
    .setThumbnail('https://i.imgur.com/b5y0nd4.png')
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
