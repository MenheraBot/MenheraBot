const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class ColorCommand extends Command {
  constructor(client) {
    super(client, {
      name: "cor",
      aliases: ["color"],
      cooldown: 5,
      clientPermissions: ["EMBED_LINKS"],
      category: "info"
    })
  }
  async run({ message, args, server }, t) {


    const user = await this.client.database.Users.findOne({ id: message.author.id });

    const haspadrao = await user.cores.filter(pc => pc.cor === "#a788ff")

    if (haspadrao.length === 0) {
      user.cores.push({
        nome: "0 - Padrão",
        cor: "#a788ff",
        preço: 0
      })
      user.save().then()
    }
    let embed = new MessageEmbed()
      .setTitle(`🏳️‍🌈 | ${t("commands:color.embed_title")}`)
      .setColor('#aee285')
      .setDescription(t("commands:color.embed_description", { prefix: server.prefix }))

    let validArgs = [];

    for (var i = 0; i < user.cores.length; i++) {
      embed.addField(`${user.cores[i].nome}`, `${user.cores[i].cor}`)
      validArgs.push(user.cores[i].nome.split(" ", 1).join(""))
    }
    if (!args[0]) return message.channel.send(message.author, embed)

    if (validArgs.includes(args[0])) {

      const findColor = user.cores.filter(cor => cor.nome.startsWith(args[0]))

      const dataChoose = {
        title: t("commands:color.dataChoose.title"),
        description: t("commands:color.dataChoose.title"),
        color: findColor[0].cor,
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png'
        }
      }

      message.channel.send(message.author, { embed: dataChoose })
      user.cor = findColor[0].cor
      user.save()

    } else message.menheraReply("error", t("commands:color.no-own", { prefix: server.prefix }))
  }
}