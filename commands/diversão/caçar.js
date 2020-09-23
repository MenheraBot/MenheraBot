const { MessageEmbed } = require("discord.js");

const database = require("../../models/user.js");

const moment = require("moment")

module.exports = {
  name: "caçar",
  aliases: ["cacar", "caça", "caca", "hunt"],
  cooldown: 3,
  category: "diversão",
  description: "Caçe demônios como XANDÂO",
  usage: "m!caçar",
  run: async (client, message, args) => {

    let user = await database.findOne({ id: message.author.id });

    const validOptions = ["demonios", "anjos", "semideuses", "deuses", "ajuda"];
    if (!args[0]) return message.channel.send(`❌ | ${message.author}, você deve escolher entre caçar \`${validOptions.join("`, `")}\``)
    const opção = validOptions.includes(args[0].normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

    if (!opção) return message.channel.send(`❌ | ${message.author}, você deve escolher entre caçar \`${validOptions.join("`, `")}\``)

    if (args[0] === "ajuda") return message.channel.send("**COMO FUNCIONA O CAÇAR?**\nVocê pode caçar a cada uma hora, e você pode escolher entre 4 caças: `demonios`, `anjos`, `semideuses` e `deuses`\nQuanto mais pra direita, mais valioso, mas também, mais dificil de se caçar, e menor a chance de sucesso\n**Boas Caçadas**")

    if (parseInt(user.caçarTime) < Date.now()) {
      let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });
      let embed = new MessageEmbed()
        .setTitle("Caçada")
        .setColor("#faa40f")
        .setThumbnail(avatar)

      switch (args[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '')) {
        case 'demonios':
          const probabilidadeDemonio = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4];
          const dc = probabilidadeDemonio[Math.floor(Math.random() * probabilidadeDemonio.length)];
          user.caçados = user.caçados + dc;
          user.caçarTime = 3600000 + Date.now();
          user.save()
          embed.setDescription(`Você saiu para caçar demônios com o Super Xandão, e caçou \`${dc}\` demônios`)
          message.channel.send(embed)
          break;
        case 'anjos':
          const probabilidadeAnjo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2];
          const da = probabilidadeAnjo[Math.floor(Math.random() * probabilidadeAnjo.length)];
          user.anjos = user.anjos + da;
          user.caçarTime = 3600000 + Date.now();
          user.save()
          embed.setDescription(`Você saiu para caçar anjos com o Super Xandão, e caçou \`${da}\` anjos`)
          message.channel.send(embed)
          break;
        case 'semideuses':
          const probabilidadeSD = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
          const ds = probabilidadeSD[Math.floor(Math.random() * probabilidadeSD.length)];
          user.semideuses = user.semideuses + ds;
          user.caçarTime = 3600000 + Date.now();
          user.save()
          embed.setDescription(`Você saiu para caçar semideuses com o Super Xandão, e caçou \`${ds}\` semideuses`)
          message.channel.send(embed)
          break;
        case 'deuses':
          const probabilidadeDeuses = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
          const dd = probabilidadeDeuses[Math.floor(Math.random() * probabilidadeDeuses.length)];
          user.deuses = user.deuses + dd;
          user.caçarTime = 3600000 + Date.now();
          user.save()
          embed.setDescription(`Você saiu para caçar deuses com o Super Xandão, e caçou \`${dd}\` deuses`)
          message.channel.send(embed)
          break;
      }
    } else {
      message.channel.send(`Descanse campeão ${message.author}, você já saiu na sua caçada. Tente novamente em **${moment.utc(parseInt(user.caçarTime - Date.now())).format("mm:ss")}** minutos`)
    }

  }
};
