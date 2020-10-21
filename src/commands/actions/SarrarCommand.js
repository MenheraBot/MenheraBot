const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class SarrarCommand extends Command {
  constructor(client) {
    super(client, {
      name: "sarrar",
      description: "Sarra comigo?",
      clientPermissions: ["EMBED_LINKS", "ADD_REACTIONS", "MANAGE_MESSAGES"],
      category: "ações",
      usage: "[@menção]"
    })
  }
  async run(message, args) {

    var listaSozinho = [
      "https://media1.tenor.com/images/e0b093e5174a74518ffcbc0967d265eb/tenor.gif?itemid=17767202",
      "https://i.imgur.com/XBcmgBR.png"
    ];

    var randSozinho = listaSozinho[Math.floor(Math.random() * listaSozinho.length)];
    let user = message.mentions.users.first();

    if (!user) {
      const embed = new MessageEmbed()
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

        let coletor = msg.createReactionCollector(filter, {
          max: 1,
          time: 30000
        });

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
    "https://i.imgur.com/m2JUJWB.gif",
    "https://i.imgur.com/ezdhV96.gif"
  ];

  var rand = lista[Math.floor(Math.random() * lista.length)];

  let avatar = message.author.displayAvatarURL({
    format: "png"
  });

  const Embed = new MessageEmbed()

    .setTitle("Sarrar")
    .setColor("#000000")
    .setDescription(`${message.author} sarrou com ${reactUser}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

  message.channel.send(Embed);
}