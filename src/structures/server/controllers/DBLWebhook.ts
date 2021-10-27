import Router from 'koa-router';
import MenheraClient from 'MenheraClient';

import { votes as constants } from '@structures/Constants';
import { MessageEmbed } from 'discord.js-light';

const runVote = async (
  client: MenheraClient,
  userId: string,
  isWeekend: boolean,
): Promise<void> => {
  const user = await client.repositories.userRepository.find(userId, ['votos']);
  if (!user) return;

  user.votos += 1;

  let { rollQuantity } = constants;
  let caçadosQuantity = 5;
  let starQuantity =
    Math.floor(Math.random() * (constants.maxStarValue - constants.minStarValue + 1)) +
    constants.minStarValue;
  let embedTitle = '🍬 | É bom votar mesmo | 🍬';
  let embedDescription = `É bom votar em mim... O dia das bruxas está chegando. Não esqueça que a noite de lua cheia está próxima\nPegue isso e suma! **${rollQuantity}**🔑, **${starQuantity}**⭐ **${caçadosQuantity}** <:Demon:758765044443381780>!\n\nSabia que a cada 20 votos você ganha um prêmio especial? E que você ja votou **${user.votos}** vezes em mim? Acho bom mesmo <:halloween:900565922836783105>`;

  if (isWeekend) {
    rollQuantity *= constants.rollWeekendMultiplier;
    starQuantity *= constants.starWeekendMultiplier;
    caçadosQuantity *= 2;
    embedTitle = '🧙‍♀️ | O FIM ESTÁ PRÓXIMO | 🧙‍♀️';
    embedDescription = `Vote... VOttee... VOOOTEEEEEEEE! O FEITIÇO ESTÁ QUASE PRONTO\nContinue votando para que o ritual se complete\n\nSuas recompensas pelos seus sacrifícios: **${rollQuantity}**🔑, **${starQuantity}**⭐, **${caçadosQuantity}** <:Demon:758765044443381780>`;
  }

  if (user.votos % 20 === 0) {
    rollQuantity *= constants.roll20Multiplier;
    starQuantity *= constants.star20Multiplier;
    caçadosQuantity *= 2;
    embedTitle =
      '<:halloween:900565922836783105> | Eu Já Sinto o Poder Emanando do Meu Corpo | <:halloween:900565922836783105>';
    embedDescription = `Continue para terminarmos o ritual, e eu ter todo o poder das Linhas Ley ❤️\n\nVocê votou ${user.votos} vezes em mim, e por isso, ganhou o **QUADRUPLO** de prêmios! Toma-te ${starQuantity}⭐, **${rollQuantity}**🔑, **${caçadosQuantity}** <:Demon:758765044443381780> \n\nVote em mim novamente em 12 horas <a:MenheraChibiTableSlam:768621225143697459>`;
  }

  if (user.votos % 20 === 0 && isWeekend) {
    caçadosQuantity *= 2;
    client.repositories.badgeRepository.addBadge(user.id, 12);
    embedTitle = '<:Demon:758765044443381780> | ESTÁ TUDO PRONTO | <:Demon:758765044443381780>';
    embedDescription = `É ISSO! VOCÊ CONSEGUIU! MEU PODER ESTÁ COMPLETO!\nGraças a sua ajuda eu consegui atingir o poder máximo! Obrigada! Agora eu posso finalmente começar com minha vingança....\nVocê recebeu **${starQuantity}** :star: , **${rollQuantity}** 🔑, **${caçadosQuantity}** <:Demon:758765044443381780> e um emblema`;
  }

  const embed = new MessageEmbed()
    .setTitle(embedTitle)
    .setColor('#F2B672')
    .setImage('https://i.imgur.com/CZdfuLN.png')
    // .setThumbnail('https://i.imgur.com/b5y0nd4.png')
    .setThumbnail('https://i.imgur.com/O2wdphz.jpg')
    .setDescription(embedDescription);

  client.repositories.userRepository.update(user.id, {
    $inc: {
      rolls: rollQuantity,
      estrelinhas: starQuantity,
      caçados: caçadosQuantity,
    },
    voteCooldown: `${Date.now() + 43200000}`,
  });

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
