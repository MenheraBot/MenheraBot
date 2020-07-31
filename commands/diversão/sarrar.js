const Discord = require("discord.js");

module.exports = {
  name: "sarrar",
  aliases: ["sarre", "brunoberti", "sarranti"],
  cooldown: 2,
  category: "diversão",
  description: "Sarra comigo?",
  usage: "m!sarrar [@menção]",
  run: async (client, message, args) => {

	return message.reply("Desculpe, este comando foi desabilitado por erros de perfmormance");

    var listaSozinho = [
      "https://media1.tenor.com/images/e0b093e5174a74518ffcbc0967d265eb/tenor.gif?itemid=17767202",
      "https://i.imgur.com/XBcmgBR.png"
    ];

    var randSozinho = listaSozinho[Math.floor(Math.random() * listaSozinho.length)];
    let user = message.mentions.users.first();

    if (!user) {
      const embed = new Discord.MessageEmbed()
        .setTitle("Sarra comigo?")
        .setColor("#000000")
        .setDescription(`Alguém quer sarrar com ${message.author}?\nReaja para sarrar`)
        .setImage(randSozinho)
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter("Quer sarrar comigo? 30 segundos para aceitar a sarrada")
        .setAuthor(message.author.tag, message.author.displayAvatarURL());

      return message.channel.send(embed).then(msg => {

        msg.react("✅").catch(err => message.channel.send("Ocorreu um erro ao adicionar uma reação, serasi eu tenho permissão para tal?"));
        let filter = (reaction, usuario) => reaction.emoji.name === "✅" && usuario.id !== message.author.id && !usuario.bot;

        let coletor = msg.createReactionCollector(filter, { max: 1, time: 30000 });

        coletor.on("collect", (react, user) => {

          msg.delete().catch();
          sarrada(message, user);

        });

      });
    } else return sarrada(message, message.mentions.users.first());

  }
}

function sarrada(message, reactUser) {


  var lista = [
    "https://media1.tenor.com/images/209f3b2875d4834f82fec9531a60412e/tenor.gif?itemid=17770012"
  ];

  var rand = lista[Math.floor(Math.random() * lista.length)];

  let avatar = message.author.displayAvatarURL({ format: "png" });

  const Embed = new Discord.MessageEmbed()

    .setTitle("Sarrar")
    .setColor("#000000")
    .setDescription(`${message.author} sarrou com ${reactUser}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setFooter("Nós somos os sarradores profissionais")
    .setAuthor(message.author.tag, avatar);

  message.channel.send(Embed);
}
