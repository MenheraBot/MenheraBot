import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import cors from '@koa/cors';

import { MessageEmbed } from 'discord.js-light';
import MenheraClient from 'MenheraClient';

import { votes as constants } from '@structures/MenheraConstants';
import HttpRequests from './HTTPrequests';

export default class DiscordBots {
  constructor(public client: MenheraClient) {
    this.client = client;
  }

  async init(): Promise<void> {
    const webhookPort = Number(process.env.DBL_PORT);
    const webhookAuth = process.env.DBL_AUTH;

    const app = new Koa();
    const router = new Router();

    app.use(koaBody());
    app.use(cors());

    router.get('/status', async (ctx) => {
      if (!ctx.headers.authorization || ctx.headers.authorization !== webhookAuth)
        return ctx.throw(401, 'You are not allowed to access that');
      ctx.body = 'ON';
      ctx.status = 200;
    });

    router.post('/webhook', async (ctx) => {
      if (!ctx.req.headers.authorization || ctx.req.headers.authorization !== webhookAuth)
        return ctx.throw(401, 'You are not allowed to access that');

      if (!ctx.request.body) {
        return ctx.throw(400, "You didn't pass an body");
      }

      const { user, isWeekend, type } = ctx.request.body;

      if (type === 'test') {
        ctx.status = 200;
        return;
      }

      this.runVote(user, isWeekend);

      ctx.status = 200;
    });

    app.use(router.routes()).use(router.allowedMethods());

    app.listen(webhookPort);
    console.log(`[KOA] Server running in port ${webhookPort}`);

    setInterval(async () => {
      if (!this.client.shard) return;
      if (!this.client.user) return;
      const info = (await this.client.shard.fetchClientValues('guilds.cache.size')) as number[];
      const res = await HttpRequests.postBotStatus(
        this.client.user.id,
        info.reduce((p, c) => p + c, 0),
      );
      this.client.users.forge(process.env.OWNER as string).send(res);
    }, 1800000);
  }

  async runVote(userId: string, isWeekend: boolean): Promise<void> {
    const user = await this.client.repositories.userRepository.find(userId);

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
      const userInShard = await this.client.users.fetch(id);
      await userInShard.send({ embeds: [embedToSend] }).catch(() => null);
    };

    sendMessageToUser(userId, embed).catch(() => null);
  }
}
