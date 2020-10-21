const Command = require("../../structures/command")
const checks = require("../../structures/RpgHandler").checks
const { MessageEmbed } = require("discord.js")
module.exports = class RegisterCommand extends Command {
    constructor(client) {
        super(client, {
            name: "register",
            aliases: ["registrar"],
            cooldown: 5,
            description: "Registre-se um aventureiro",
            clientPermissions: ["EMBED_LINKS"],
            category: "rpg"
        })

    }
    async run(message, args) {

        const user = await this.client.database.Rpg.findById(message.author.id);

        if (user) return message.channel.send(`<:negacao:759603958317711371> | Você já é um aventureiro, ${message.author.username}-sama`)

        const classes = ["Assassino", "Bárbaro", "Clérigo", "Druida", "Espadachim", "Feiticeiro", "Monge", "Necromante"];

        let description = `Bem-vindo, ${message.author.username}!\nVocê deseja ser um aventureiro?\nQual classe você deseja ser?\nDúvidas com qual classe escolher? Entre no [SITE DA MENHERA](https://sites.google.com/view/menherabot/classes) para ver cada classe\n`;

        let embed = new MessageEmbed()
            .setTitle("<:guilda:759892389724028948> | Guilda de Aventureiros")
            .setColor('#ffec02')
            .setFooter("Digite no chat a opção de sua escolha")

        for (var i = 0; i < classes.length; i++) {
            description += `\n${i + 1} - **${classes[i]}**`
        }
        embed.setDescription(description);
        message.channel.send(embed);

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

        collector.on('collect', m => {

            switch (m.content) {
                case '1':
                    this.confirmação(message, 'Assassino')
                    break;
                case '2':
                    this.confirmação(message, 'Bárbaro')
                    break;
                case '3':
                    this.confirmação(message, 'Clérigo')
                    break;
                case '4':
                    this.confirmação(message, 'Druida')
                    break;
                case '5':
                    this.confirmação(message, 'Espadachim')
                    break;
                case '6':
                    this.confirmação(message, 'Feiticeiro')
                    break;
                case '7':
                    this.confirmação(message, 'Monge')
                    break;
                case '8':
                    this.confirmação(message, 'Necromante')
                    break;
                default:
                    return message.channel.send("<:negacao:759603958317711371> | Esta opção não é uma classe válida!")
            }
        })
    }
    confirmação(message, option) {

        message.channel.send(`<:atencao:759603958418767922> | Você realmente deseja ser um \`${option}\`? Você nunca mais poderá trocar isso!\n\nEnvie 'sim' no chat para confirmar sua escolha`);

        const filtro = m => m.author.id === message.author.id;
        const confirmCollector = message.channel.createMessageCollector(filtro, { max: 1, time: 15000, errors: ["time"] });

        confirmCollector.on('collect', async m => {

            if (m.content.toLowerCase() === "sim") {
                message.channel.send(`<:positivo:759603958485614652> | Bem-vindo ao mundo de **Boleham**, ${message.author}! Sua classe é **${option}**, agora você já pode usar meus comandos de RPG`);
                let user = await new this.client.database.Rpg({
                    _id: message.author.id,
                    class: option
                }).save()
                checks.confirmRegister(user, message)
            } else message.channel.send("<:negacao:759603958317711371> | Você cancelou a confirmação")
        })
    }
};
