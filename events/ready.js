const moment = require("moment");

moment.locale("pt-br");

module.exports = (client) => {

 client.user.setActivity("Fui reiniciada com sucesso uwu")
 console.log("=================================================================")

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