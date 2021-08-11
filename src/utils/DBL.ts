import DBL from 'dblapi.js';

import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';

import { votes as constants } from '@structures/MenheraConstants';

export default class DiscordBots {
  constructor(public client: MenheraClient) {
    this.client = client;
  }

  async init(): Promise<void> {
    if (!process.env.DBL_TOKEN) {
      throw new Error('No DBL token provided');
    }

    if (!process.env.DBLHOOK_PORT) {
      throw new Error('No DBLHOOK port provided');
    }

    const dbl = new DBL(
      process.env.DBL_TOKEN,
      {
        webhookPort: Number(process.env.DBLHOOK_PORT),
        webhookAuth: process.env.DBL_AUTH,
      },
      this.client,
    );

    if (!dbl.webhook) {
      throw new Error('DBL webhook not found');
    }

    dbl.webhook.on('vote', async (vote) => {
      const user = await this.client.repositories.userRepository.find(vote.user);

      if (!user) return;

      user.votos += 1;

      let { rollQuantity } = constants;
      let starQuantity =
        Math.floor(Math.random() * (constants.maxStarValue - constants.minStarValue + 1)) +
        constants.minStarValue;
      let embedTitle = '<:God:758474639570894899> | Obrigada por votar em mim';
      let embedDescription = `Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nComo forma de agradecimento, você recebeu **1**🔑 e **${starQuantity}**⭐!\n\nSabia que a cada 20 votos você ganha um prêmio especial? E que você ja votou **${user.votos}** vezes em mim? **OBRIGADA**\n\nVote em mim novamente em 12 horas <a:LevelUp:760954035779272755>`;

      if (vote.isWeekend) {
        rollQuantity *= constants.rollWeekendMultiplier;
        starQuantity *= constants.starWeekendMultiplier;
        embedTitle = '<:Angel:758765044204437535> | OWO VOCÊ RECEBEU UM PRÊMIO ESPECIAL!!!';
        embedDescription = `Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nComo forma de agradecimento, você recebeu **${rollQuantity}**🔑 e **${starQuantity}**⭐! Você está com **${user.votos}** votos\n\nPor hoje ser final de semana, você recebeu o DOBRO dos premios`;
      }

      if (user.votos % 20 === 0) {
        rollQuantity *= constants.roll20Multiplier;
        starQuantity *= constants.star20Multiplier;
        embedTitle = '<:Angel:758765044204437535> | OWO VOCÊ RECEBEU UM PRÊMIO ESPECIAL!!!';
        embedDescription = `Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nVocê votou ${user.votos} vezes em mim, e por isso, ganhou o **QUADRUPLO** de prêmios! Toma-te ${starQuantity}⭐ e **${rollQuantity}**🔑 \n\nVote em mim novamente em 12 horas <a:LevelUp:760954035779272755>`;
      }

      if (user.votos % 20 === 0 && vote.isWeekend) {
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
        await userInShard.send({ embeds: [embedToSend] });
      };

      sendMessageToUser(vote.user, embed).catch();
    });

    setInterval(async () => {
      if (!this.client.shard) return;
      const info = (await this.client.shard.fetchClientValues('guilds.cache.size')) as number[];
      const guildCount = info.reduce((prev, val) => prev + val);
      const shardId = 0;
      const shardsCount = this.client.shard.count;
      await dbl.postStats(guildCount, shardId, shardsCount);
    }, 1800000);
  }
}
