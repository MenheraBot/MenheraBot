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
      if (user) {
        const random = Math.floor(Math.random() * (1400 - 340 + 1)) + 340;
        user.rolls += 1;
        user.estrelinhas += random;
        user.votos += 1;
        const usuarioDm = await this.client.users.fetch(vote.user).catch();
        const embed = new MessageEmbed()
          .setTitle('<:God:758474639570894899> | Obrigada por votar em mim')
          .setColor('#fa73e5')
          .setThumbnail('https://i.imgur.com/b5y0nd4.png')
          .setDescription(`Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nComo forma de agradecimento, você recebeu **1**🔑 e **${random}**⭐!\n\nSabia que a cada 20 votos você ganha um prêmio especial? E que você ja votou **${user.votos}** vezes em mim? **OBRIGADA**\n\nVote em mim novamente em 12 horas <a:LevelUp:760954035779272755>`);
        if (user.votos % 20 === 0) {
          embed.setTitle('<:Angel:758765044204437535> | OWO VOCÊ RECEBEU UM PRÊMIO ESPECIAL!!!');
          embed.setDescription(`Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nVocê votou ${user.votos} vezes em mim, e por isso, ganhou o **TRIPLO** de prêmios! Toma-te ${random * 3}⭐ e **3**🔑 \n\nVote em mim novamente em 12 horas <a:LevelUp:760954035779272755>`);
          user.rolls += 3;
          user.estrelinhas += (random * 3);
        }
        user.save();
        if (usuarioDm) await usuarioDm.send(embed).catch();
      }
    });

    dbl.on('posted', () => {
      console.log('[DBL] Stats do bot postados');
    });

    this.client.setInterval(() => {
      dbl.postStats(this.client.guilds.cache.size);
    }, 1800000);
  }
};
