const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
const version = require("../../../package.json").version
module.exports = class UpdatesCommand extends Command {
    constructor(client) {
        super(client, {
            name: "updates",
            aliases: ["update"],
            cooldown: 5,
            clientPermissions: ["EMBED_LINKS"],
            category: "info"
        })
    }
    async run({ message, args, server }, t) {

        const owner = await this.client.users.fetch(this.client.config.owner[0])

        const embed = new MessageEmbed()
            .setTitle(`${t("commands:updates.title")} ${version}`)
            .setColor('#a7e74f')
            .setFooter(`${this.client.user.username} ${t("commands:updates.footer")} ${owner.tag}`, owner.displayAvatarURL({ format: "png", dynamic: true }))
            .setDescription(`**MOCHILAS**
O rpg agora tem mochilas! Você pode ver sua mochila no inventário!Você não pode ter mais itens do que sua mochila comporta (isso n acontece pra quem tem mais itens do que espaço atualmente)

        **ATENÇÃO:** Darei 7 dias para todos que possuem mais itens do que a mochila comporta em seu inventário gastarem seus itens, caso contrário, será removido todos os itens até a mochila ficar de acordo com o inventário!

        • NOVO: Agora é possivel comprar mochilas no ferreiro!

        `)


        message.channel.send(message.author, embed)
    }
}