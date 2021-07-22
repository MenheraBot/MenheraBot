import DBL from 'dblapi.js';

import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';

export default class DiscordBots {
  constructor(public client: MenheraClient) {
    this.client = client;
  }

  async init() {
    const dbl = new DBL(
      process.env.DBL_TOKEN,
      {
        webhookPort: parseInt(process.env.DBLHOOK_PORT),
        webhookAuth: process.env.DBL_AUTH,
      },
      this.client,
    );

    dbl.webhook.on('vote', async (vote) => {
      const user = await this.client.database.Users.findOne({ id: vote.user });
      const rpgUser = await this.client.database.Rpg.findById(vote.user);

      if (!user) return;

      user.votos += 1;

      const constants = this.client.constants.votes;

      let { rollQuantity, rpgRollQuantity } = constants;
      let starQuantity =
        Math.floor(Math.random() * (constants.maxStarValue - constants.minStarValue + 1)) +
        constants.minStarValue;
      let rpgMoneyQuantity =
        Math.floor(Math.random() * (constants.maxStoneValue - constants.minStoneValue + 1)) +
        constants.minStoneValue;
      let embedTitle = '<:God:758474639570894899> | Obrigada por votar em mim';
      let embedDescription = `Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nComo forma de agradecimento, você recebeu **1**🔑 e **${starQuantity}**⭐!\n\nSabia que a cada 20 votos você ganha um prêmio especial? E que você ja votou **${user.votos}** vezes em mim? **OBRIGADA**\n\nVote em mim novamente em 12 horas <a:LevelUp:760954035779272755>`;

      if (vote.isWeekend) {
        rollQuantity *= constants.rollWeekendMultiplier;
        starQuantity *= constants.starWeekendMultiplier;
        rpgRollQuantity *= constants.stoneWeekendMultiplier;
        rpgMoneyQuantity *= constants.rpgRollWeekendMultiplier;
        embedTitle = '<:Angel:758765044204437535> | OWO VOCÊ RECEBEU UM PRÊMIO ESPECIAL!!!';
        embedDescription = `Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nComo forma de agradecimento, você recebeu **${rollQuantity}**🔑 e **${starQuantity}**⭐! Você está com **${user.votos}** votos\n\nPor hoje ser final de semana, você recebeu o DOBRO dos premios`;
      }

      if (user.votos % 20 === 0) {
        rollQuantity *= constants.roll20Multiplier;
        starQuantity *= constants.star20Multiplier;
        rpgRollQuantity *= constants.rpgMoney20Multiplier;
        rpgMoneyQuantity *= constants.rpgRoll20Multiplier;
        embedTitle = '<:Angel:758765044204437535> | OWO VOCÊ RECEBEU UM PRÊMIO ESPECIAL!!!';
        embedDescription = `Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nVocê votou ${user.votos} vezes em mim, e por isso, ganhou o **QUADRUPLO** de prêmios! Toma-te ${starQuantity}⭐ e **${rollQuantity}**🔑 \n\nVote em mim novamente em 12 horas <a:LevelUp:760954035779272755>`;
      }

      if (user.votos % 20 === 0 && vote.isWeekend) {
        embedTitle = 'O MÁXIMO DE PRÊMIOS MLKK';
        embedDescription = `MANOOOOO TU CONSEGUIU O MÁXIMO DE PRÊMIOS!!!!\nPor hoje ser final de semana, e este voto seu é múltiplo de 20, você recebeu 6x mais prêmios!\nVocê recebeu **${starQuantity}** :star: e **${rollQuantity}** 🔑`;
      }

      if (rpgUser) {
        embedDescription += `\n\nPor você jogar meu RPG, também te darei mais prêmios! Você recebeu **${rpgRollQuantity}** rolls para reset da dungeon (use \`m!roll rpg\`) e também recebeu **${rpgMoneyQuantity}** :gem:`;
        rpgUser.money += rpgMoneyQuantity;
        rpgUser.resetRoll += rpgRollQuantity;
        await rpgUser.save();
      }

      const embed = new MessageEmbed()
        .setTitle(embedTitle)
        .setColor('#fa73e5')
        .setThumbnail('https://i.imgur.com/b5y0nd4.png')
        .setDescription(embedDescription);

      user.rolls += rollQuantity;
      user.estrelinhas += starQuantity;
      user.voteCooldown = Date.now() + 43200000;
      await user.save();

      const functionToEval = async (id: string, embedToSend: MessageEmbed) => {
        let hasSend = false;
        const userInShard = await this.client.users.fetch(id).catch();

        if (userInShard && !hasSend) {
          hasSend = true;
          try {
            await userInShard.send(embedToSend);
          } catch {
            // console.log('[DBL] Cannot send message to user');
          }
        }
      };
      // @ts-ignore
      await this.client.shard.broadcastEval(functionToEval(vote.user, embed));
    });

    this.client.setInterval(async () => {
      const guilds = await this.client.shardManager.getAllSizeObject('guilds');
      const shardId = 0;
      const shardsCount = this.client.shard.count;
      dbl.postStats(guilds, shardId, shardsCount);
    }, 1800000);
  }
}
