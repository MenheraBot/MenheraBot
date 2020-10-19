const database = require("../../models/user.js");

module.exports = {
    name: "coinflip",
    aliases: ["cf"],
    cooldown: 5,
    category: "economia",
    dir: 'CoinflipCommand',
    description: "Aposte estrelinhas num cara ou coroa com alguem",
    userPermission: null,
    clientPermission: ["ADD_REACTIONS"],
    usage: "m!coinflip <menção> <valor>",
    run: async (client, message, args) => {

        const user1 = message.author
        const user2 = message.mentions.users.first()
        const valor = args[1]
        
        if(!user2) return message.channel.send("<:negacao:759603958317711371> | Você não mencionou seu adversário")
        if(user2.bot) return message.channel.send("<:negacao:759603958317711371> | Bots não podem apostar e.e")
        if(user2.id === user1.id) return message.channel.send("<:negacao:759603958317711371> | Você não pode apostar contra si mesmo")

        if(isNaN(parseInt(valor))) return message.channel.send("<:negacao:759603958317711371> | Este valor não é válido")
        if(parseInt(valor) < 1) return message.channel.send("<:negacao:759603958317711371> | Este valor não é válido")

        const db1 = await database.findOne({id: user1.id})
        const db2 = await database.findOne({id: user2.id})

        if(!db1 || !db2) return message.channel.send("<:negacao:759603958317711371> | Este usuário não possui uma conta no Menhera's Bank!")

        if(valor > db1.estrelinhas) return message.channel.send("<:negacao:759603958317711371> | Você não possui todas essas estrelinhas para apostar!")
        if(valor > db2.estrelinhas) return message.channel.send(`<:negacao:759603958317711371> | ${user2} não possui todas essas estrelinhas para apostar!`)

        message.channel.send(`${user2}, ${user1} te desafiou para uma aposta de Cara ou Coroa valendo **${valor}** :star:. Caso caia Cara, ${user1} vence, caso caia coroa, ${user2} vence!\n${user2} deve aceitar reagindo com ✅! Tu tens 5 segundos!`).then(msg => {

            msg.react('✅');
            let filter = (reaction, usuario) => reaction.emoji.name === "✅" && usuario.id === user2.id;

            let coletor = msg.createReactionCollector(filter, { max: 1, time: 5000})

            coletor.on("collect", r => {
                const shirleyTeresinha = ["Cara", "Coroa"]
                const choice = shirleyTeresinha[Math.floor(Math.random() * shirleyTeresinha.length)]

                switch(choice){
                    case 'Cara':
                    message.channel.send(`:coin: | **CARA**\n${user1} ganhou ${valor} :star: apostando com ${user2}! Sinto muito ${user2}, nem sempre saimos vitoriosos`)
                    db1.estrelinhas = db1.estrelinhas + parseInt(valor)
                    db2.estrelinhas = db2.estrelinhas - parseInt(valor)
                    db1.save()
                    db2.save()
                        break
                    case 'Coroa':
                        message.channel.send(`:coin: | **COROA**\n${user2} ganhou **${valor}** :star: apostando com ${user1}! Sinto muito ${user1}, nem sempre saimos vitoriosos`)
                        db1.estrelinhas = db1.estrelinhas - parseInt(valor)
                        db2.estrelinhas = db2.estrelinhas + parseInt(valor)
                        db1.save()
                        db2.save()
                        break
                }
            })
        })

    }
}