const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class InventoryCommand extends Command {
    constructor(client) {
        super(client, {
            name: "inventário",
            aliases: ["inventario", "inv", "inventory"],
            cooldown: 5,
            clientPermissions: ["EMBED_LINKS"],
            category: "rpg"
        })
    }
    async run({ message, args, server }, t) {

        const user = await this.client.database.Rpg.findById(message.author.id)
        if (!user) return message.menheraReply("error", t("commands:inventory.non-aventure"))

        const usuarioInDb = await this.client.database.Users.findOne({ id: message.author.id })

        let cor = usuarioInDb.cor || "#8f877f"

        let embed = new MessageEmbed()
            .setTitle(`<:Chest:760957557538947133> | ${t("commands:inventory.title")}`)
            .setColor(cor)

        let loots = [];
        let items = [];
        let lootText = "";
        let armaText = "";
        let itemText = "";

        if (user.loots.length > 0) {
            user.loots.forEach(lot => {
                loots.push(lot.name)
            })
        }

        user.inventory.forEach(inv => {
            if (inv.type == "Item") {
                items.push(inv.name)
            }
        })

        armaText += `🗡️ | ${t("commands:inventory.weapon")}: **${user.weapon.name}**\n🩸 | ${t("commands:inventory.dmg")}: **${user.weapon.damage}**\n\n`
        armaText += `🧥 | ${t("commands:inventory.armor")}: **${user.protection.name}**\n🛡️ | ${t("commands:inventory.prt")}: **${user.protection.armor}**\n`

        countItems(items).forEach(count => {
            itemText += `**${count.name}** (${count.amount})\n`
        })


        countItems(loots).forEach(count => {
            lootText += `**${count.name}** ( ${count.amount} )\n`
        })


        if (armaText.length > 0) embed.addField(`⚔️ | ${t("commands:inventory.battle")}`, armaText)
        if (items.length > 0) embed.addField(`💊 | ${t("commands:inventory.items")}`, itemText)
        if (lootText.length > 0) embed.addField(`<:Chest:760957557538947133> | ${t("commands:inventory.loots")}`, lootText)

        message.channel.send(message.author, embed)
    }
}

function countItems(arr) {
    const countMap = {};
    for (const element of arr) {
        countMap[element] = (countMap[element] || 0) + 1;
    }
    return Object.entries(countMap).map(([value, count]) => ({
        name: value,
        amount: count
    }));
}
