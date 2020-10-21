const Command = require("../../structures/command")
module.exports = class UnwarnCommand extends Command {
    constructor(client) {
        super(client, {
            name: "unwarn",
            description: "Retire um aviso de um usuário",
            userPermissions: ["KICK_MEMBERS"],
            category: "moderação",
            usage: "<usuário>"
        })
    }
    async run(message, args) {

        const user = message.mentions.users.first() || client.users.cache.get(args[0]);
        if (!user) return message.channel.send("<:negacao:759603958317711371> | Nenhum usuário foi mencionado");
        if (user.bot) return message.channel.send("<:negacao:759603958317711371> | Não tem como tirar avisos de algo que nunca terá avisos");
        if (user.id === message.author.id) return message.channel.send("<:negacao:759603958317711371> | PARA PARA PARA PARA PARA PARA PARA. Você não vai tirar seus próprios avisos. JOÃO KLEBER")
        if (!message.guild.members.cache.get(user.id)) return message.channel.send("<:negacao:759603958317711371> | Este membro não está neste servidor!!!")

        this.client.database.Warns.findOneAndDelete({ userId: user.id, guildId: message.guild.id }).sort([
            ['data', 'descending']
        ]).exec((err, db) => {
            if (err) console.log(err);
            if (!db || db.length < 1) return message.channel.send(`<:negacao:759603958317711371> | ${user} não possui avisos para deletar`);
            message.channel.send("<:positivo:759603958485614652> | Aviso removido com sucesso")
        })
    }
}