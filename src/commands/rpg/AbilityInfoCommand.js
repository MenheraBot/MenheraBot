const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
const abilitiesFile = require("../../structures/RpgHandler").abiltiies
module.exports = class AbilityInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: "infohabilidade",
            aliases: ["ih", "abilityinfo"],
            cooldown: 10,
            clientPermissions: ["EMBED_LINKS"],
            category: "rpg"
        })
    }
    async run({ message, args, server }, t) {

        if (!args[0]) return message.menheraReply("question", t("commands:infohabilidade.no-args"))

        const validArgs = [{
            opção: "classe",
            arguments: ["classe", "class", "c"]
        },
        {
            opção: "minhas",
            arguments: ["minhas", "minha", "meu", "meus", "mine", "my"]
        }
        ]

        const selectedOption = validArgs.some(so => so.arguments.includes(args[0].toLowerCase()))
        if (!selectedOption) return message.menheraReply("error", t("commands:infohabilidade.invalid-option"))
        const filtredOption = validArgs.filter(f => f.arguments.includes(args[0].toLowerCase()))

        const option = filtredOption[0].opção

        switch (option) {
            case 'classe':
                if (!args[1]) return message.menheraReply("error", t("commands:infohabilidade.no-class"))
                this.getClass(message, args[1], t)
                break;
            case 'minhas':
                this.getAll(message, t)
                break
        }
    }
    getClass(message, classe, t) {

        const classes = ["assassino", "barbaro", "clerigo", "druida", "espadachim", "feiticeiro", "monge", "necromante"]

        const normalized = classe.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (!classes.includes(normalized)) return message.menheraReply("error", t("commands:infohabilidade.invalid-class"))

        let filtrado;

        switch (normalized) {
            case 'assassino':
                filtrado = abilitiesFile.assassin
                break;
            case 'barbaro':
                filtrado = abilitiesFile.barbarian
                break;
            case 'clerigo':
                filtrado = abilitiesFile.clerigo
                break;
            case 'druida':
                filtrado = abilitiesFile.druida
                break;
            case 'espadachim':
                filtrado = abilitiesFile.espadachim
                break;
            case 'feiticeiro':
                filtrado = abilitiesFile.feiticeiro
                break;
            case 'monge':
                filtrado = abilitiesFile.monge
                break;
            case 'necromante':
                filtrado = abilitiesFile.necromante
                break;
        }

        const filtredOption = filtrado.uniquePowers

        let embed = new MessageEmbed()
            .setTitle(`🔮 | ${t("commands:infohabilidade.abilities", { class: classe })}`)
            .setColor('#9cfcde')

        filtredOption.forEach(hab => {
            embed.addField(hab.name, `📜 | **${t("commands:infohabilidade.desc")}:** ${hab.description}\n⚔️ | **${t("commands:infohabilidade.dmg")}:** ${hab.damage}\n💉 | **${t("commands:infohabilidade.heal")}:** ${hab.heal}\n💧 | **${t("commands:infohabilidade.cost")}:** ${hab.cost}\n🧿 | **${t("commands:infohabilidade.type")}:** ${hab.type}`)
        })

        return message.channel.send(message.author, embed)

    }
    async getAll(message, t) {

        const user = await this.client.database.Rpg.findById(message.author.id)
        if (!user) return message.menheraReply("error", t("commands:infohabilidade.non-aventure"))

        let filtrado;

        switch (user.class) {
            case 'Assassino':
                filtrado = abilitiesFile.assassin
                break;
            case 'Senhor das Sombras':
                filtrado = abilitiesFile.assassin
                break;
            case 'Bárbaro':
                filtrado = abilitiesFile.barbarian
                break;
            case 'Berserker':
                filtrado = abilitiesFile.barbarian
                break;
            case 'Clérigo':
                filtrado = abilitiesFile.clerigo
                break;
            case 'Arcanjo':
                filtrado = abilitiesFile.clerigo
                break;
            case 'Druida':
                filtrado = abilitiesFile.druida
                break;
            case 'Guardião da Natureza':
                filtrado = abilitiesFile.druida
                break;
            case 'Espadachim':
                filtrado = abilitiesFile.espadachim
                break;
            case 'Mestre das Armas':
                filtrado = abilitiesFile.espadachim
                break;
            case 'Feiticeiro':
                filtrado = abilitiesFile.feiticeiro
                break;
            case 'Senhor das Galáxias':
                filtrado = abilitiesFile.feiticeiro
                break;
            case 'Mestre dos Elementos':
                filtrado = abilitiesFile.feiticeiro
                break;
            case 'Conjurador Demoníaco':
                filtrado = abilitiesFile.feiticeiro
                break;
            case 'Monge':
                filtrado = abilitiesFile.monge
                break;
            case 'Sacerdote':
                filtrado = abilitiesFile.monge
                break;
            case 'Necromante':
                filtrado = abilitiesFile.necromante
                break;
            case 'Senhor das Trevas':
                filtrado = abilitiesFile.necromante
                break;
        }

        let uniquePowerFiltred = filtrado.uniquePowers.filter(f => f.name == user.uniquePower.name)
        let abilitiesFiltred = [];

        user.abilities.forEach(hab => {
            let a = filtrado.normalAbilities.filter(f => f.name == hab.name)
            abilitiesFiltred.push(a[0])
        })

        let embed = new MessageEmbed()
            .setTitle(`🔮 | ${t("commands:infohabilidade.your-abilities")}`)
            .setColor('#a9ec67')

        embed.addField(` ${t("commands:infohabilidade.uniquePower")}: ` + uniquePowerFiltred[0].name, `📜 | **${t("commands:infohabilidade.desc")}:** ${uniquePowerFiltred[0].description}\n⚔️ | **${t("commands:infohabilidade.dmg")}:** ${uniquePowerFiltred[0].damage}\n💉 | **${t("commands:infohabilidade.heal")}:** ${uniquePowerFiltred[0].heal}\n💧 | **${t("commands:infohabilidade.cost")}:** ${uniquePowerFiltred[0].cost}`)

        abilitiesFiltred.forEach(hab => {
            embed.addField(`🔮 | ${t("commands:infohabilidade.ability")}: ` + hab.name, `📜 | **${t("commands:infohabilidade.desc")}:** ${hab.description}\n⚔️ | **${t("commands:infohabilidade.dmg")}:** ${hab.damage}\n💉 | **${t("commands:infohabilidade.heal")}:** ${hab.heal}\n💧 | **${t("commands:infohabilidade.cost")}:** ${hab.cost}`)
        })

        if (user.hasFamily) {
            const familia = await this.client.database.Familias.findById(user.familyName)
            familia.abilities.forEach(hab => {
                embed.addField(`🔮 | ${t("commands:infohabilidade.familyAbility")}: ` + hab.name, `📜 | **${t("commands:infohabilidade.desc")}:** ${hab.description}\n⚔️ | **${t("commands:infohabilidade.dmg")}:** ${hab.damage}\n💉 | **${t("commands:infohabilidade.heal")}:** ${hab.heal}\n💧 | **${t("commands:infohabilidade.cost")}:** ${hab.cost}`)
            })
        }
        return message.channel.send(message.author, embed)
    }
};
