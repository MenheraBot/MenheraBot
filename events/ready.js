
const DBL = require("dblapi.js");
module.exports = (client) => {
  const config = require("../config.json");
  

  if (client.user.id == "708014856711962654") {
    const dbl = new DBL(config.dbt, client);
    dbl.postStats(client.guilds.cache.size)
    dbl.on("error", console.error)
  }

 client.user.setActivity("Fui reiniciada com sucesso uwu")
 console.log("Menhera se conectou com o Discord!")
    
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
    {name: "Duvidas? Entre em meu servidor de suporte m!suporte", type: "PLAYING"}
    ];

  setInterval(() => {
    let randomStatus = status[Math.floor(Math.random() * status.length)]
    client.user.setPresence({ activity: randomStatus })
  }, 1000 * 60);
}