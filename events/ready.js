const moment = require("moment");
const DBL = require("dblapi.js")
const config = require("../config.json")
const database = require("../models/user.js")
const { MessageEmbed } = require("discord.js")

moment.locale("pt-br");

module.exports = (client) => {

const dbl = new DBL(config.dbt, { webhookPort: 8000, webhookAuth: config.webhookAuth }, client);

dbl.webhook.on('vote', async vote => {
  const user = await database.findOne({id: vote.user});
  if(user){
    let random = Math.floor(Math.random() * (1400 - 340 + 1)) + 340
			user.rolls = user.rolls + 1
      user.estrelinhas = user.estrelinhas + random;
      user.votos = user.votos + 1;
      user.save()
      const usuarioDm = await client.users.cache.get(vote.user)
      const embed = new MessageEmbed()
      .setTitle("<:God:758474639570894899> | Obrigada por votar em mim")
      .setColor("#fa73e5")
      .setThumbnail('https://i.imgur.com/b5y0nd4.png')
      .setDescription(`Obrigada por votar em mim bebezinho, cada voto me ajuda e inspira minha dona a continuar me cuidando! ❤️\n\nComo forma de agradecimento, você recebeu **1**🔑 e **${random}**⭐!\n\nSabia que você ja votou **${user.votos}** vezes em mim? **OBRIGADA**\n\nVote em mim novamente em 12 horas <a:LevelUp:760954035779272755>`)
      if(usuarioDm) usuarioDm.send(embed).catch()
  }
})

 client.user.setActivity("Fui reiniciada com sucesso uwu")

 console.log(`[READY] Menhera se conectou com o Discord! (${moment(Date.now()).format("l LTS")})`)
    
  let status = [
    {name: "a moon ser perfeita", type: "WATCHING"},
    {name: "o meu servidor de suporte m!suporte", type: "LISTENING"},
    {name: "sabia que a moon é a salvação da minha dona? sem moon, menhera = inexistente m!moon", type: "PLAYING"},
    {name: "a vida é dificil, mas estamos aqui pra facilitá-la", type: "PLAYING"},
    {name: "já votou em mim hoje? m!votar", type: "PLAYING"},
    {name: "Caçe demônios com XANDÃO. m!caçar", type: "PLAYING"},
    {name: "Tem ideia de um comando interessante? Use m!sugerir", type: "PLAYING"},
    {name: "Pergunte para mim. m!8ball", type: "PLAYING"},
    {name: "Dificuldade com um comando? Use m!help comando", type: "PLAYING"},
    {name: "Encontrou um bug? Reporte com m!bug", type: "PLAYING"},
    {name: "Duvidas? Entre em meu servidor de suporte m!suporte", type: "PLAYING"},
    {name: "Fique por dentro das minhas novidades em meu servidor de suporte", type: "PLAYING"},
    {name: "Sabia que eu tenho um rpg? m!help", type: "PLAYING"},
    {name: "Registre-se um aventureiro com m!register, e vá para aventuras na dungeon com m!dungeon", type: "PLAYING"},
    {name: "#NERFAOSMOBSMEDIOS😢😢😢", type: "PLAYING"}
    ];

  setInterval(() => {
    let randomStatus = status[Math.floor(Math.random() * status.length)]
    client.user.setPresence({ activity: randomStatus })
  }, 1000 * 60);
}