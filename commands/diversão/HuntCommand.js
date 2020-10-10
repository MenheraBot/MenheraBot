const {
  MessageEmbed
} = require("discord.js");
const database = require("../../models/user.js");
const moment = require("moment")

module.exports = {
  name: "caçar",
  aliases: ["cacar", "caça", "caca", "hunt"],
  cooldown: 5,
  category: "diversão",
  dir: 'HuntCommand',
  description: "Caçe demônios como XANDÂO",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!caçar",
  run: async (client, message, args) => {

    let user = await database.findOne({
      id: message.author.id
    });

    const validOptions = ["demonios", "anjos", "semideuses", "deuses", "ajuda", "probabilidades"];

    const validArgs = [{
        opção: "demônio",
        arguments: ["demonios", "demônios", "demons", "demonio", "demônio"]
      },
      {
        opção: "anjos",
        arguments: ["anjos", "anjo", "angels"]
      },
      {
        opção: "semideuses",
        arguments: ["semideuses", "semideus", "semi-deuses", "sd", "semi-deus"]
      },
      {
        opção: "deus",
        arguments: ["deus", "deuses", "gods", "god"]
      },
      {
        opção: "ajuda",
        arguments: ["ajudas", "help", "h", "ajuda"]
      },
      {
        opção: "probabilidades",
        arguments: ["probabilidades", "probabilidade", "probability", "probabilities"]
      }
    ];


    if (!args[0]) return message.channel.send(`<:negacao:759603958317711371> | ${message.author}, você deve escolher entre caçar \`${validOptions.join("`, `")}\``)
    const selectedOption = validArgs.some(so => so.arguments.includes(args[0].toLowerCase()))
    if (!selectedOption) return message.channel.send(`<:negacao:759603958317711371> | ${message.author}, você deve escolher entre caçar \`${validOptions.join("`, `")}\``)
    const filtredOption = validArgs.filter(f => f.arguments.includes(args[0].toLowerCase()))

    const option = filtredOption[0].opção

    if (!option) return message.channel.send(`<:negacao:759603958317711371> | ${message.author}, você deve escolher entre caçar \`${validOptions.join("`, `")}\``)

    //probabilidades normais
    const probabilidadeDemonioBasica = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4];
    const probabilidadeAnjoBasica = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2];
    const probabilidadeSDBasica = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    const probabilidadeDeusesBasica = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
    //probabilidades do servidor de suporte
    const probabilidadeDemonioServer = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4];
    const probabilidadeAnjoServer = [0, 0, 0, 1, 1, 1, 1, 2];
    const probabilidadeSDServer = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    const probabilidadeDeusesServer = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];

    let probabilidadeDemonio;
    let probabilidadeAnjo;
    let probabilidadeSD;
    let probabilidadeDeuses;

    if (message.guild.id === '717061688460967988') {
      probabilidadeDemonio = probabilidadeDemonioServer;
      probabilidadeAnjo = probabilidadeAnjoServer;
      probabilidadeSD = probabilidadeSDServer;
      probabilidadeDeuses = probabilidadeDeusesServer;
    } else {
      probabilidadeDemonio = probabilidadeDemonioBasica;
      probabilidadeAnjo = probabilidadeAnjoBasica;
      probabilidadeSD = probabilidadeSDBasica;
      probabilidadeDeuses = probabilidadeDeusesBasica;
    }


    if (option === "ajuda") return message.channel.send("**COMO FUNCIONA O CAÇAR?**\nVocê pode caçar a cada uma hora, e você pode escolher entre 4 caças: `demonios`, `anjos`, `semideuses` e `deuses`\nQuanto mais pra direita, mais valioso, mas também, mais dificil de se caçar, e menor a chance de sucesso\nEm meu servidor de suporte, as chances de caça são maiores!\n**Boas Caçadas**")
    if (option === "probabilidades") return message.channel.send(`**PROBABILIDADES:**\nÉ selecionado um número aleatório dentro dos próximos. Cada número é a quantidade de caças\nDica: Em meu servidor de suporte, as chances de caça são maiores!\n\nDemônio: \`${probabilidadeDemonio}\`\nAnjo: \`${probabilidadeAnjo}\`\nSemideuses: \`${probabilidadeSD}\`\nDeuses: \`${probabilidadeDeuses}\``)

    if (parseInt(user.caçarTime) < Date.now()) {
      let avatar = message.author.displayAvatarURL({
        format: "png",
        dynamic: true
      });
      let embed = new MessageEmbed()
        .setTitle("Caçada")
        .setColor("#faa40f")
        .setThumbnail(avatar)
        .setFooter('Sabia que em meu servidor de suporte, suas chances de sucesso são maiores?')

      switch (option) {
        case 'demônio':
          const dc = probabilidadeDemonio[Math.floor(Math.random() * probabilidadeDemonio.length)];
          user.caçados = user.caçados + dc;
          user.caçarTime = 3600000 + Date.now();
          user.save()
          embed.setDescription(`Você saiu para caçar demônios com o Super Xandão, e caçou \`${dc}\` demônios`)
          message.channel.send(embed)
          break;
        case 'anjos':
          const da = probabilidadeAnjo[Math.floor(Math.random() * probabilidadeAnjo.length)];
          user.anjos = user.anjos + da;
          user.caçarTime = 3600000 + Date.now();
          user.save()
          embed.setDescription(`Você saiu para caçar anjos com o Super Xandão, e caçou \`${da}\` anjos`)
          message.channel.send(embed)
          break;
        case 'semideuses':
          const ds = probabilidadeSD[Math.floor(Math.random() * probabilidadeSD.length)];
          user.semideuses = user.semideuses + ds;
          user.caçarTime = 3600000 + Date.now();
          user.save()
          embed.setDescription(`Você saiu para caçar semideuses com o Super Xandão, e caçou \`${ds}\` semideuses`)
          message.channel.send(embed)
          break;
        case 'deus':
          const dd = probabilidadeDeuses[Math.floor(Math.random() * probabilidadeDeuses.length)];
          user.deuses = user.deuses + dd;
          user.caçarTime = 3600000 + Date.now();
          user.save()
          if (dd > 0) embed.setColor('#e800ff')
          embed.setDescription((dd > 0) ? `CARACA!!! VOCÊ SE MOSTROU UM HERÓI FRUTO DE UMA VONTADE DIVINA, ASSIM COMO XANDÃO, E CONSEGUIU CAÇAR \`${dd}\` DEUS!!!!!!` : `Caçar Deuses é uma missão extremamente difícil, e você acabou não conseguindo, levando um total de \`${dd}\` deuses pra casa`)
          message.channel.send(embed)
          break;
      }
    } else {
      message.channel.send(`<:negacao:759603958317711371> | Descanse campeão ${message.author}, você já saiu na sua caçada. Tente novamente em **${moment.utc(parseInt(user.caçarTime - Date.now())).format("mm:ss")}** minutos\n<:atencao:759603958418767922> | **DICA:** Sabia que em meu servidor de suporte, as chances de caça são maiores? m!suporte`)
    }

  }
};