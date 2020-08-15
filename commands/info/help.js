const Discord = require("discord.js");
const {stripIndents} = require("common-tags")
module.exports = {
    name: "help",
    aliases: ["ajuda", "comandos", "socorro","h"],
    cooldown: 5,
    category: "info",
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
    const embed = new Discord.MessageEmbed()
        .setColor("#c0abf2")
        .setTitle("Comandos Disponíveis")
        .setFooter("Você pode ver ajuda sobre um comando em específico usando m!ajuda comando")

    const commands = (category) => {
        return client.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `- ${cmd.name}`)
            .join("\n");
    }

    const info = client.categories
        .map(cat => stripIndents`**${cat[0].toUpperCase() + cat.slice(1)}** \n${commands(cat)}`)
        .reduce((string, category) => string + "\n" + category);

    return message.channel.send(embed.setDescription(info));
}

function getCMD(client, message, input) {
    const embed = new Discord.MessageEmbed()

    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));
    
    let info = `Sem informações para o comando **${input.toLowerCase()}**`;

    if (!cmd) {
        return message.channel.send(embed.setColor("#ff0000").setDescription(info));
    }

    if (cmd.name) info = `**Comando**: ${cmd.name}`;
    if (cmd.aliases) info += `\n**Pode ser chamado por**: ${cmd.aliases.map(a => `\`${a}\``).join(", ")}`;
    if (cmd.description) info += `\n**Descrição**: ${cmd.description}`;
    if (cmd.usage) {
        info += `\n**Como usar**: ${cmd.usage}`;
        embed.setFooter(`Sintaxe: <> = necessita, [] = opcional`);
    }

    return message.channel.send(embed.setColor("#00ffe1").setDescription(info));
}