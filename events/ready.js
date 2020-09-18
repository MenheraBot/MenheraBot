const Discord = require("discord.js")

module.exports = (client) => {

  client.user.setActivity("Fui reiniciada com sucesso uwu")
    
  let status = [
    {name: "a moon ser perfeita", type: "WATCHING"},
    {name: "o meu servidor de suporte m!suporte", type: "LISTENING"},
    {name: "sabia que a moon é a salvação da minha dona? sem moon, menhera = inexistente m!moon", type: "PLAYING"},
    {name: "a vida é dificil, mas estamos aqui pra facilitá-la", type: "PLAYING"},
    {name: "skilly é meu sonho de vida", type: "PLAYING"},
    {name: "já votou em mim hoje? m!votar", type: "PLAYING"},
    {name: "Minha dona está apaixnadinha uwuwuwu", type: "PLAYING"},
    {name: "Caçe demônios com XANDÃO. m!caçar", type: "PLAYING"},
    {name: "Tem ideia de um comando interessante? Use m!sugerir", type: "PLAYING"},
    {name: "Pergunte para mim. m!8ball", type: "PLAYING"},
    {name: "Dificuldade com um comando? Use m!help comando", type: "PLAYING"},
    {name: "Encontrou um bug? Reporte com m!bug", type: "PLAYING"},
    {name: "Duvidas? Entre em meu servidor de suporte m!suporte", type: "PLAYING"}
    ];

  setInterval(() => {
    let randomStatus = status[Math.floor(Math.random() * status.length)]
    client.user.setPresence({ activity: randomStatus })
  }, 1000 * 60);
}