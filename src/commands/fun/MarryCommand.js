const Command = require("../../structures/command")
const moment = require("moment");
moment.locale("pt-br")

module.exports = class MarryCommand extends Command {
    constructor(client) {
        super(client, {
            name: "casar",
            aliases: ["marry"],
            description: "Casa com alguem",
            category: "diversão",
            usage: "<@menção>",
            clientPermission: ["EMBED_LINKS", "ADD_REACTIONS", "MANAGE_MESSAGES"],
        })
    }
    async run(message, args) {

        const mencionado = message.mentions.users.first();

        if (!mencionado) return message.channel.send("<:negacao:759603958317711371> | Mencione o usuário com que desejas casar");
        if (mencionado.bot) return message.channel.send("<:negacao:759603958317711371> | voce não pode se casar com bots");
        if (mencionado.id === message.author.id) return message.channel.send("<:negacao:759603958317711371> | Você não pode se casar consigo mesmo :(")

        const user1 = await this.client.database.Users.findOne({ id: message.author.id })

        if (user1.casado && user1.casado != "false") return message.channel.send("<:atencao:759603958418767922> | Você já está casado!!")

        const user2 = await this.client.database.Users.findOne({ id: user1.casado })

        if (!user2) return message.channel.send("<:atencao:759603958418767922> | Mame este usuário para adicioná-lo ao meu banco de dados")

        if (user2.casado && user2.casado != "false") return message.channel.send("<:atencao:759603958418767922> | Este usuário já está casado");

        message.channel.send(`${mencionado} aceitas se casar com ${message.author}? Você tem 15 segundos para aceitar`).then(msg => {

            msg.react("✅")
            msg.react("❌")

            let filterYes = (reaction, usuario) => reaction.emoji.name === "✅" && usuario.id === mencionado.id;
            let filterNo = (reação, user) => reação.emoji.name === "❌" && user.id === mencionado.id;

            let yesColetor = msg.createReactionCollector(filterYes, { max: 1, time: 14500 });
            let noColetor = msg.createReactionCollector(filterNo, { max: 1, time: 14500 });

            noColetor.on("collect", co => {
                msg.reactions.removeAll().catch();
                return message.channel.send(`${mencionado} negou se casar com ${message.author}`);
            });

            yesColetor.on("collect", cp => {
                msg.reactions.removeAll().catch();
                message.channel.send(`💍${message.author} acaba de se casar com ${mencionado}💍`);

                var dataFormated = moment(Date.now()).format("l LTS")

                user1.casado = mencionado.id;
                user1.data = dataFormated;

                user2.casado = message.author.id;
                user2.data = dataFormated;

                user1.save()
                user2.save()
                return
            })
        })
        
    }
};