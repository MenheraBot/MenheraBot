const {MessageEmbed} = require("discord.js");
module.exports = {
    name: "help",
    aliases: ["ajuda", "comandos", "socorro","h"],
    cooldown: 5,
    category: "util",
    description: "Mostra a pagina de ajuda do bot",
    usage: "m!help [comando]",
    run: async (client, message, args) => {
        if (args[0]) {
            return getCMD(client, message, args[0]);
        } else {
            return getAll(client, message);
        }
    }
}

function getAll(client, message) {

    const embed = new MessageEmbed()
    embed.setColor('#b880e6')
    embed.setThumbnail(client.user.displayAvatarURL())
    
    embed.addField(`Ações (${getCommmandSize("ações", client)})`, getCategory("ações", client))
    embed.addField(`Diversão (${getCommmandSize("diversão", client)})`, getCategory("diversão", client))
    embed.addField(`Economia (${getCommmandSize("economia", client)})`, getCategory("economia", client))
    embed.addField(`Info (${getCommmandSize("info", client)})`, getCategory("info", client))
    embed.addField(`Moderação (${getCommmandSize("moderação", client)})`, getCategory("moderação", client))
    embed.addField(`RPG (${getCommmandSize("rpg", client)})`, getCategory("rpg", client))
    embed.addField(`Útil (${getCommmandSize("util", client)})`, getCategory("util", client))

    embed.addField("Links Adicionais", "[Adicione-me](https://discord.com/api/oauth2/authorize?client_id=708014856711962654&permissions=1007025271&scope=bot)|[Vote em mim](https://top.gg/bot/708014856711962654/vote)|[Meu servidor de Suporte](https://discord.gg/fZMdQbA)")

    message.author.send(embed).then(() => {
        message.reply("enviei meus comandos para sua dm, olha lá >.<")
    }).catch(() => {
        message.reply("aparentemente suas dms estão fechadas, não posso te enviar minha página de ajuda")
    })

}

function getCategory(category, client) {
    return client.commands.filter(c => c.category === category).map(c => `\`m!${c.name}\``).join(", ")
}

function getCommmandSize(category, client) {
    return client.commands.filter(c => c.category === category).size
}

function getCMD(client, message, input) {
    const embed = new MessageEmbed()

    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));
    
    let info = `Sem informações para o comando **${input.toLowerCase()}**`;

    if (!cmd) {
        return message.channel.send(embed.setColor("#ff0000").setDescription(info));
    }

    if (cmd.name) info = `**Comando**: ${cmd.name}`;
    if (cmd.aliases) info += `\n**Pode ser chamado por**: ${cmd.aliases.map(a => `\`${a}\``).join(", ")}`;
    if (cmd.description) info += `\n**Descrição**: ${cmd.description}`;
    if(cmd.cooldown) info += `\n**Cooldown**: ${cmd.cooldown} segundos`
    if (cmd.usage) {
        info += `\n**Como usar**: ${cmd.usage}`;
        embed.setFooter(`Sintaxe: <> = necessita, [] = opcional`);
    }

    return message.channel.send(embed.setColor("#00ffe1").setDescription(info));
}