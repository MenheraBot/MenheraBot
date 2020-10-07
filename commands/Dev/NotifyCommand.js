module.exports = {
    name: "notify",
    aliases: ["notificar", "updates", "notificações"],
    cooldown: 5,
    category: "Dev",
    dir: 'NotifyCommand',
    description: "Receba minhas notificações de atualização",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
    usage: "m!notify",
    
    run: async (client, message, args) => {

        if(message.guild.id != "717061688460967988") return message.channel.send("<:negacao:759603958317711371> | Este comando só pode ser usado em meu servidor de suporte\n`m!suporte`");

        const cargo = client.guilds.cache.get('717061688460967988').roles.cache.get('755593580285788280');

        if(message.member.roles.cache.has("755593580285788280")) {
        message.member.roles.remove(cargo);
        message.channel.send("<:positivo:759603958485614652> | você não receberá mais notificações de atualizações minhas :(")
        } else {
        message.member.roles.add(cargo)
        message.channel.send("<:positivo:759603958485614652> | você receberá notificações de atualizações minhas >.<")
        }
}}