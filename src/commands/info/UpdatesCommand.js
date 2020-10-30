const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class UpdatesCommand extends Command {
    constructor(client) {
        super(client, {
            name: "update",
            aliases: ["updates"],
            cooldown: 5,
            clientPermissions: ["EMBED_LINKS"],
            category: "info"
        })
    }
    async run({ message, args, server }, t) {

        const owner = await this.client.users.fetch(this.client.config.owner[0])

        const embed = new MessageEmbed()
            .setTitle(`${t("commands:updates.title")} ${require("../../../package.json").version}`)
            .setColor('#a7e74f')
            .setFooter(`${this.client.user.username} ${t("commands:updates.footer")} ${owner.tag}`, owner.displayAvatarURL({ format: "png", dynamic: true }))
            .setDescription(`**MOCHILAS**
O rpg agora tem mochilas! Você pode ver sua mochila no inventário!Você não pode ter mais itens do que sua mochila comporta (isso n acontece pra quem tem mais itens do que espaço atualmente)

        **ATENÇÃO:** Darei 7 dias para todos que possuem mais itens do que a mochila comporta em seu inventário gastarem seus itens, caso contrário, será removido todos os itens até a mochila ficar de acordo com o inventário!
`)


        message.channel.send(message.author, embed)
    }
}