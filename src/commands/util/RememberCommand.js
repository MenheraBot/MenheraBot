/* 

    Este é o meu primeiro documento que eu comento >...<

 */
const Command = require("../../structures/command")

module.exports = class RememberCommand extends Command {
    constructor(client) {
        super(client, {
            name: "remember",
            aliases: ["lembrar", "lembrete"],
            cooldown: 5,
            category: "util",
            clientPermissions: ["ADD_REACTIONS", "MANAGE_MESSAGES"]
        })
    }
    async run({ message, args, server }, t) {

        if (!args[0]) return message.menheraReply("error", t("commands:remember.no-args")) // Se não passar argumentos, retornamos
        const content = args.join(" ")

        message.menheraReply("question", t("commands:remember.get-time"))

        // Filtros para os coletores
        const filter = m => m.author.id === message.author.id
        const reactFilter = (reaction, user) => ['📩', '⬇️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;

        // Criação do Coletor de Mensagens
        const collector = message.channel.createMessageCollector(filter, { max: 1 });

        // Evento ao coletar algo
        collector.on('collect', async m => {
            const tempo = m.content.toLowerCase().split(/ +/g) // Separando a mensagem em um array

            let days = "0"
            let hours = "0"
            let min = "0"

            // Adiciona os tempos as variaveis
            await tempo.forEach(t => {
                if (t.indexOf("m") > -1) min = t.replace(/\D+/g, '')
                if (t.indexOf("h") > -1) hours = t.replace(/\D+/g, '')
                if (t.indexOf("d") > -1) days = t.replace(/\D+/g, '')
            });

            // Multiplicação de milisegundos pelo tempo desejado
            const toMilisDays = parseInt(days) * 1000 * 60 * 60 * 24
            const toMilisHours = parseInt(hours) * 1000 * 60 * 60
            const toMilismin = parseInt(min) * 1000 * 60
            const tempoTotal = Date.now() + toMilisDays + toMilisHours + toMilismin

            if (tempoTotal < (Date.now() + 1000 * 60 * 5)) return message.menheraReply("error", t("commands:remember.low-time")) // Checa se o tempo é menor que 5 minutos
            if (tempoTotal > (Date.now() + 1000 * 60 * 60 * 24 * 7)) return message.menheraReply("error", t("commands:remember.high-time")) // Checa se o tempo é maior que 7 dias

            // Enviando a mensagem e criando o coletor de emojis usando promises
            message.menheraReply("question", t("commands:remember.confirm-message", { days, hours, minutes: min })).then(async m => {
                await m.react('📩').catch()
                await m.react('⬇️').catch()
                await m.react('❌').catch()

                m.awaitReactions(reactFilter, { max: 1 })
                    .then(async collected => {
                        const reaction = collected.first();
                        // Reações com suas respectivas funções
                        if (reaction.emoji.name === '📩') {
                            await m.delete({ timeout: 20 }).catch()
                            message.menheraReply("success", t("commands:remember.dm"))
                            new this.client.database.Reminders({
                                id: message.author.id,
                                rememberAt: tempoTotal,
                                createdAt: Date.now(),
                                channelId: message.channel.id,
                                serverId: message.guild.id,
                                serverLang: server.lang,
                                content: content,
                                rememberInPv: true
                            }).save()
                        } else if (reaction.emoji.name === '⬇️') {
                            await m.delete({ timeout: 20 }).catch()
                            message.menheraReply("success", t("commands:remember.channel"))
                            new this.client.database.Reminders({
                                id: message.author.id,
                                rememberAt: tempoTotal,
                                createdAt: Date.now(),
                                channelId: message.channel.id,
                                serverId: message.guild.id,
                                serverLang: server.lang,
                                content: content,
                                rememberInPv: false
                            }).save()
                        } else {
                            await m.delete({ timeout: 20 }).catch()
                            return message.menheraReply("success", t("commands:remember.cancel"))
                        }
                    })
            })
        })
    }
}