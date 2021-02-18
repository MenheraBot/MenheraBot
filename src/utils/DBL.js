const DBL = require('dblapi.js');
const { MessageEmbed } = require('discord.js');

module.exports = class DiscordBots {
  constructor(client) {
    this.client = client;
  }

  async init() {
    const dbl = new DBL(this.client.config.dbt, {
      webhookPort: 8000,
      webhookAuth: this.client.config.webhookAuth,
    }, this.client);

    dbl.webhook.on('vote', async (vote) => {
      const user = await this.client.database.Users.findOne({ id: vote.user });
      const rpgUser = await this.client.database.Rpg.findById(vote.user);

      if (!user) return;

      user.votos += 1;

      let rollQuantity = 1;
      let starQuantity = Math.floor(Math.random() * (5600 - 1200 + 1)) + 1200;
      let rpgRollQuantity = 1;
      let rpgMoneyQuantity = Math.floor(Math.random() * (2600 - 500 + 1)) + 500;
      let embedTitle = '<:God:758474639570894899> | Obrigada por votar em mim';
      let embedDescription = `Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nComo forma de agradecimento, você recebeu **1**🔑 e **${starQuantity}**⭐!\n\nSabia que a cada 20 votos você ganha um prêmio especial? E que você ja votou **${user.votos}** vezes em mim? **OBRIGADA**\n\nVote em mim novamente em 12 horas <a:LevelUp:760954035779272755>`;

      if (vote.isWeekend) {
        rollQuantity *= 2;
        starQuantity *= 2;
        rpgRollQuantity *= 2;
        rpgMoneyQuantity *= 2;
        embedTitle = '<:Angel:758765044204437535> | OWO VOCÊ RECEBEU UM PRÊMIO ESPECIAL!!!';
        embedDescription = `Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nComo forma de agradecimento, você recebeu **${rollQuantity}**🔑 e **${starQuantity}**⭐!\n\nPor hoje ser final de semana, você recebeu o DOBRO dos premios`;
      }

      if (user.votos % 20 === 0) {
        rollQuantity *= 4;
        starQuantity *= 4;
        rpgRollQuantity *= 4;
        rpgMoneyQuantity *= 4;
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
      user.voteCooldown = (Date.now() + 43200000);
      await user.save();

      const functionToEval = async (id, embedToSend) => {
        let hasSend = false;
        const userInShard = await this.client.users.fetch(id).catch();

        if (userInShard && !hasSend) {
          hasSend = true;
          await userInShard.send(embedToSend).catch();
        }
      };

      await this.client.shard.broadcastEval(functionToEval(vote.user, embed)).then(console.log('[DLB] Tentativa de enviar para um usuário'));
    });

    dbl.on('posted', () => {
      console.log('[DBL] Stats do bot postados');
    });

    this.client.setInterval(async () => {
      const guilds = await this.client.shardManager.getAllSizeObject('guilds');
      const shardId = 0;
      const shardsCount = this.client.shard.count;
      dbl.postStats(guilds, shardId, shardsCount);
    }, 1800000);
  }
};
