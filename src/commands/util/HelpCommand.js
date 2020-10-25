const Command = require("../../structures/command")

const { MessageEmbed } = require("discord.js")

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: "help",
            aliases: ["ajuda", "h"],
            cooldown: 5,
            category: "util",
            clientPermissions: ["EMBED_LINKS"],
        })
    }
    async run({ message, args, server }, t) {

        if (args[0]) {
            return getCMD(this.client, message, args[0], t);
        } else {
            return getAll(this.client, message, t);
        }
    }
}

function getAll(client, message, t) {

    const embed = new MessageEmbed()
    embed.setColor('#b880e6')
    embed.setThumbnail(client.user.displayAvatarURL())

    embed.addField(`${t("commands:help.actions")} (${getCommmandSize("ações", client)})`, getCategory("ações", client))
    embed.addField(`${t("commands:help.fun")} (${getCommmandSize("diversão", client)})`, getCategory("diversão", client))
    embed.addField(`${t("commands:help.economy")} (${getCommmandSize("economia", client)})`, getCategory("economia", client))
    embed.addField(`${t("commands:help.info")} (${getCommmandSize("info", client)})`, getCategory("info", client))
    embed.addField(`${t("commands:help.mod")} (${getCommmandSize("moderação", client)})`, getCategory("moderação", client))
    embed.addField(`${t("commands:help.rpg")} (${getCommmandSize("rpg", client)})`, getCategory("rpg", client))
    embed.addField(`${t("commands:help.util")} (${getCommmandSize("util", client)})`, getCategory("util", client))

    embed.addField(t("commands:help.link_name"), t("commands:help.link_value"))

    message.author.send(embed).then(() => {
        message.menheraReply("success", t("commands:help.dm_sent"))
    }).catch(() => {
        message.menheraReply("error", t("commands:help.dm_error"))
    })
}

function getCategory(category, client) {
    return client.commands.filter(c => c.config.category === category).map(c => `\`m!${c.config.name}\``).join(", ")
}

function getCommmandSize(category, client) {
    return client.commands.filter(c => c.config.category === category).size
}

function getCMD(client, message, input, t) {
    const embed = new MessageEmbed()

    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));

    let info = t("commands:help.without-info", {cmd: input.toLowerCase()});

    if (!cmd) {
        return message.channel.send(embed.setColor("#ff0000").setDescription(info));
    }

    if (cmd.config.name) info = `**${t("commands:help.cmd")}**: ${cmd.config.name}`;
    if (cmd.config.aliases.length > 0) info += `\n**${t("commands:help.aliases")}**: ${cmd.config.aliases.map(a => `\`${a}\``).join(", ")}`;
    if (cmd.config.description) info += `\n**${t("commands:help.desc")}**: ${t(`commands:${cmd.config.name}.description`)}`;
    if (cmd.config.cooldown) info += `\n**Cooldown**: ${cmd.config.cooldown} segundos`
    if (cmd.config.usage) {
        info += `\n**Como usar**: ${cmd.config.usage}`;
        embed.setFooter(`Sintaxe: <> = necessita, [] = opcional`);
    }

    return message.channel.send(embed.setColor("#00ffe1").setDescription(info));
}