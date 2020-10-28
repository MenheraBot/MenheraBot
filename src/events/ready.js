const DBL = require("dblapi.js")
const { MessageEmbed } = require("discord.js")
const http = require("../utils/HTTPrequests")

module.exports = class ReadyEvent {
  constructor(client) {
    this.client = client
  }
  async run() {

    if (this.client.user.id == "708014856711962654") {
      const dbl = new DBL(this.client.config.dbt, {
        webhookPort: 8000,
        webhookAuth: this.client.config.webhookAuth
      }, this.client);

      dbl.webhook.on('vote', async vote => {
        const user = await this.client.database.Users.findOne({ id: vote.user });
        if (user) {
          let random = Math.floor(Math.random() * (1400 - 340 + 1)) + 340
          user.rolls = user.rolls + 1
          user.estrelinhas = user.estrelinhas + random;
          user.votos = user.votos + 1;
          const usuarioDm = await this.client.users.fetch(vote.user).catch()
          let embed = new MessageEmbed()
            .setTitle("<:God:758474639570894899> | Obrigada por votar em mim")
            .setColor("#fa73e5")
            .setThumbnail('https://i.imgur.com/b5y0nd4.png')
            .setDescription(`Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nComo forma de agradecimento, você recebeu **1**🔑 e **${random}**⭐!\n\nSabia que a cada 20 votos você ganha um prêmio especial? E que você ja votou **${user.votos}** vezes em mim? **OBRIGADA**\n\nVote em mim novamente em 12 horas <a:LevelUp:760954035779272755>`)
          if (user.votos % 20 === 0) {
            embed.setTitle("<:Angel:758765044204437535> | OWO VOCÊ RECEBEU UM PRÊMIO ESPECIAL!!!")
            embed.setDescription(`Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nVocê votou ${user.votos} vezes em mim, e por isso, ganhou o **TRIPLO** de prêmios! Toma-te ${random * 3}⭐ e **3**🔑 \n\nVote em mim novamente em 12 horas <a:LevelUp:760954035779272755>`)
            user.rolls = user.rolls + 3
            user.estrelinhas = user.estrelinhas + (random * 3);
          }
          user.save()
          if (usuarioDm) {
            try {
              usuarioDm.send(embed)
            } catch {
              // So ignora fodase
            }
          }
        }
      })

      dbl.on('posted', () => {
        console.log('[DLB] Stats do bot postados');
      })

      setInterval(() => {
        dbl.postStats(this.client.guilds.cache.size);
      }, 1800000);

    }
    this.client.user.setActivity("Fui reiniciada com sucesso uwu")

    console.log(`[READY] Menhera se conectou com o Discord!`)
    http.status("ready")

    let status = [{ name: "a moon ser perfeita", type: "WATCHING" },
    { name: "o meu servidor de suporte m!suporte", type: "LISTENING" },
    { name: "sabia que a moon é a salvação da minha dona? sem moon, menhera = inexistente m!moon", type: "PLAYING" },
    { name: "a vida é dificil, mas estamos aqui pra facilitá-la", type: "PLAYING" },
    { name: "já votou em mim hoje? m!votar", type: "PLAYING" },
    { name: "Caçe demônios com XANDÃO. m!caçar", type: "PLAYING" },
    { name: "Tem ideia de um comando interessante? Use m!sugerir", type: "PLAYING" },
    { name: "Pergunte para mim. m!8ball", type: "PLAYING" },
    { name: "Dificuldade com um comando? Use m!help comando", type: "PLAYING" },
    { name: "Encontrou um bug? Reporte com m!bug", type: "PLAYING" },
    { name: "Duvidas? Entre em meu servidor de suporte m!suporte", type: "PLAYING" },
    { name: "Fique por dentro das minhas novidades em meu servidor de suporte", type: "PLAYING" },
    { name: "Sabia que eu tenho um rpg? m!help", type: "PLAYING" },
    { name: "Registre-se um aventureiro com m!register, e vá para aventuras na dungeon com m!dungeon", type: "PLAYING" },
    { name: "#NERFAOSMOBSMEDIOS😢😢😢", type: "PLAYING" }
    ];

    setInterval(() => {
      let randomStatus = status[Math.floor(Math.random() * status.length)]
      this.client.user.setPresence({
        activity: randomStatus
      })
    }, 1000 * 60);
  }
}
