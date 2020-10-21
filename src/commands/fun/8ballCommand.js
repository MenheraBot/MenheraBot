const Command = require("../../structures/command")
module.exports = class EightBallCommand extends Command {
    constructor(client) {
        super(client, {
            name: "8ball",
            description: "Pergunte algo para mim",
            usage: "<pergunta>",
            category: "diversão"
        })
    }
    async run(message, args) {

        if (args.length < 1) return message.channel.send("<:negacao:759603958317711371> | Você deve enviar uma pergunta para eu responder")

        let respostas = [
            "<:positivo:759603958485614652> | Acho que sim",
            "<:negacao:759603958317711371> | Provavelmente não",
            "<:positivo:759603958485614652> | Com toda certeza do universo",
            "<:negacao:759603958317711371> | Meus circuitos me fazem crer que isso é impossível",
            "<:positivo:759603958485614652> | Se pá que sim",
            "<:positivo:759603958485614652> | Nada é impossivel né maninho 😉",
            "<:positivo:759603958485614652> | Sim <:ok:727975974125436959>",
            "<:negacao:759603958317711371> | Não ;(",
            "<:positivo:759603958485614652> | Talvez ",
            "<:positivo:759603958485614652> | Rola um D20 pra ver isso aí",
            "<:positivo:759603958485614652> | Sim sim sim sim SIM SIM SIIIIM!!!!",
            "<:positivo:759603958485614652> | Kkk tu ainda pergunta?",
            "<:negacao:759603958317711371> | Ah cara, eu não queria te falar, mas não",
            "<:positivo:759603958485614652> | Também queria saber",
            "<:positivo:759603958485614652> | Isso vai ser melhor pra ti saber no futuro",
            "<:positivo:759603958485614652> | Certeza absoluta",
            "<:negacao:759603958317711371> | Minha resposta é não",
            "<:positivo:759603958485614652> | Minha resposta é sim",
            "<:positivo:759603958485614652> | Não queria te dar esperançar, mas talvez sim",
            "<:negacao:759603958317711371> | Claro que não né",
            "<:positivo:759603958485614652> | Claro que sim uai",
            "<:positivo:759603958485614652> | O minha flor, eu sei que tu não queria que fosse, mas sim",
            "<:negacao:759603958317711371> | $%&*&%#¨%¨@&%¨&#@%$#%@#¨%#¨@%@$#% &¨%&$ #%¨#%¨%#¨¨&¨% ¨%&%¨& &¨%$&*¨&",
            "<:positivo:759603958485614652> | Absolutamente"
        ];

        const respostaRandom = respostas[Math.floor(Math.random() * respostas.length)];

        message.channel.send(`${respostaRandom}, ${message.author}`)

    }
}