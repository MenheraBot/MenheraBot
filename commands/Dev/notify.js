module.exports = {
    name: "notify",
    aliases: ["notificar", "updates", "notificações"],
    cooldown: 2,
    category: "Dev",
    description: "Receba minhas notificações de atualização",
    usage: "m!notify",
    
    run: async (client, message, args) => {

        if(message.guild.id != "717061688460967988") return message.reply("Este comando só pode ser usado em meu servidor de suporte\n`m!suporte`");

        const cargo = client.guilds.cache.get('717061688460967988').roles.cache.get('755593580285788280');

        if(message.member.roles.cache.has("755593580285788280")) {
        message.member.roles.remove(cargo);
        message.reply("você não receberá mais notificações de atualizações minhas :(")
        } else {
        message.member.roles.add(cargo)
        message.reply("você receberá notificações de atualizações minhas >.<")
        }
}}