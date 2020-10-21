const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class ColorCommand extends Command {
    constructor(client) {
        super(client, {
            name: "cor",
            aliases: ["color"],
            cooldown: 5,
            description: "Mude a cor de seu perfil",
            usage: "[cor]",
            clientPermissions: ["EMBED_LINKS"],
            category: "info"
        })
    }
    async run(message, args) {


        const user = await this.client.database.Users.findOne({id: message.author.id});
      
          const haspadrao = await user.cores.filter(pc => pc.nome === "0 - Padrão")
      
          if (haspadrao.length === 0) {
            user.cores.push({
              nome: "0 - Padrão",
              cor: "#a788ff",
              preço: 0
            })
            user.save().then()
          }
          let embed = new MessageEmbed()
            .setTitle("🏳️‍🌈 | Suas Cores")
            .setColor('#aee285')
            .setDescription("Use m!cor [escolha] para trocar a cor de seu perfil")
      
          let validArgs = [];
      
          for (var i = 0; i < user.cores.length; i++) {
            embed.addField(`${user.cores[i].nome}`, `${user.cores[i].cor}`)
            validArgs.push(user.cores[i].nome.split(" ", 1).join(""))
          }
          if (!args[0]) return message.channel.send(message.author, embed)
      
          if (validArgs.includes(args[0])) {
      
            const findColor = user.cores.filter(cor => cor.nome.startsWith(args[0]))
      
            const dataChoose = {
              title: "Sua cor foi alterada com sucesso",
              description: "Você ja pode ver seu perfil com sua nova cor!",
              color: findColor[0].cor,
              thumbnail: {
                url: 'https://i.imgur.com/t94XkgG.png'
              }
            }
      
            message.channel.send(message.author, {embed: dataChoose})
            user.cor = findColor[0].cor
            user.save()
      
          } else message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não possui esta cor! Use m!cor para ver as cores disponíveis`)
    }
}