const {
    MessageEmbed
} = require("discord.js");
const database = require("../../models/rpg.js");
const checks = require("../../Rpgs/checks.js")

module.exports = {
    name: "register",
    aliases: ["registrar", "registro"],
    cooldown: 10,
    dir: 'RegisterCommand',
    category: "rpg",
    description: "Registre-se um aventureiro",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
    usage: "m!register",
    run: async (client, message, args) => {

        const user = await database.findById(message.author.id);

        if (user) return message.channel.send(`<:negacao:759603958317711371> | Você já é um aventureiro, ${message.author.username}-sama`)

        const classes = [
            "Assassino", "Bárbaro", "Clérigo", "Druida", "Espadachim", "Feiticeiro", "Monge", "Necromante"
        ];

        let description = `Bem-vindo, ${message.author.username}!\nVocê deseja ser um aventureiro?\nQual classe você deseja ser?\nDúvidas com qual classe escolher? Entre no [SITE DA MENHERA](https://sites.google.com/view/menherabot/classes) para ver cada classe\n`;

        let embed = new MessageEmbed()
            .setTitle("<:guilda:759892389724028948> | Guilda de Aventureiros")
            .setColor('#ffec02')
            .setFooter("Digite no chat a opção de sua escolha")

        for (i = 0; i < classes.length; i++) {
            description += `\n${i + 1} - **${classes[i]}**`
        }
        embed.setDescription(description);
        message.channel.send(embed);

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, {
            max: 1,
            time: 30000,
            errors: ["time"]
        });

        collector.on('collect', m => {

            switch (m.content) {
                case '1':
                    confirmação(message, 'Assassino')
                    break;
                case '2':
                    confirmação(message, 'Bárbaro')
                    break;
                case '3':
                    confirmação(message, 'Clérigo')
                    break;
                case '4':
                    confirmação(message, 'Druida')
                    break;
                case '5':
                    confirmação(message, 'Espadachim')
                    break;
                case '6':
                    confirmação(message, 'Feiticeiro')
                    break;
                case '7':
                    confirmação(message, 'Monge')
                    break;
                case '8':
                    confirmação(message, 'Necromante')
                    break;
                default:
                    return message.channel.send("<:negacao:759603958317711371> | Esta opção não é uma classe válida!")
            }
        })
    }
};

function confirmação(message, option) {


    message.channel.send(`<:atencao:759603958418767922> | Você realmente deseja ser um \`${option}\`? Você nunca mais poderá trocar isso!\n\nEnvie 'sim' no chat para confirmar sua escolha`);

    const filtro = m => m.author.id === message.author.id;
    const confirmCollector = message.channel.createMessageCollector(filtro, {
        max: 1,
        time: 15000,
        errors: ["time"]
    });

    confirmCollector.on('collect', async m => {

        if (m.content.toLowerCase() === "sim") {
            message.channel.send(`<:positivo:759603958485614652> | Bem-vindo ao mundo de **Boleham**, ${message.author}! Sua classe é **${option}**, agora você já pode usar meus comandos de RPG`);
            await new database({
                _id: message.author.id,
                class: option
            }).save()
            checks.confirmRegister(message.author.id, message)
        } else message.channel.send("<:negacao:759603958317711371> | Você cancelou a confirmação")

    })

}