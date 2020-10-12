const database = require("../../models/rpg")
const familyDb = require("../../models/familia")
module.exports = {
    name: "depositar",
    aliases: ["deposite"],
    cooldown: 3,
    category: "rpg",
    dir: 'DepositeCommand',
    description: "Deposita uma certa quantia no banco da Família",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
    usage: "m!depositar <valor>",
    run: async (client, message, args) => {

        const user = await database.findById(message.author.id)
        if (!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro")
        if (!user.hasFamily) return message.channel.send("<:negacao:759603958317711371> | Você não está em nenhuma família")

        const familia = await familyDb.findById(user.familyName)

        const valor = parseInt(args[0])
        if (!valor || valor < 1) return message.channel.send("<:negacao:759603958317711371> | Este valor não é válido")

        if (valor > user.money) return message.channel.send("<:negacao:759603958317711371> | Você não tem todas essas pedras mágicas")

        user.money = user.money - valor
        familia.bank = parseInt(familia.bank) + valor
        user.save()
        familia.save()

        message.channel.send(`<:positivo:759603958485614652> | Você transferiu com sucesso ${valor} :gem: para o banco da família!`)
        setTimeout(() => {
            if (parseInt(familia.bank) >= parseInt(familia.nextLevel)) {
                client.channels.cache.get("730903350169698314").send(`A família **${user.familyName}** acabou de passar de nível com o depósito de **${client.users.cache.get(user._id)}**\nAgora, a família \`${user.familyName}\` está nível **${familia.levelFamilia + 1}**\n\n@here`)
                CheckLevel(message, familia)
            }
        }, 500)
       
    }
}

async function CheckLevel(message, familia) {

    //Freya, Soma e Apolo mudar na DB, o resto é automáico

    switch (familia._id) {
        case 'Loki': //Aumento do dano de ataque
            familia.levelFamilia = familia.levelFamilia + 1
            familia.boost.value = familia.boost.value + 10
            familia.nextLevel = parseInt(familia.nextLevel) + 30000
            break
        case 'Freya': //Aumento da Mana máxima
            familia.levelFamilia = familia.levelFamilia + 1
            familia.boost.value = familia.boost.value + 50
            familia.nextLevel = parseInt(familia.nextLevel) + 30000
            familia.members.forEach(async membro => {
                const user = await database.findById(membro)
                user.maxMana = user.maxMana + 50
                user.save()
            });
            break
        case 'Ares': //Aumento da defesa
            familia.levelFamilia = familia.levelFamilia + 1
            familia.boost.value = familia.boost.value + 50
            familia.nextLevel = parseInt(familia.nextLevel) + 30000
            break
        case 'Soma': //Aumento de vida máxima
            familia.levelFamilia = familia.levelFamilia + 1
            familia.boost.value = familia.boost.value + 100
            familia.nextLevel = parseInt(familia.nextLevel) + 30000
            familia.members.forEach(async membro => {
                const user = await database.findById(membro)
                user.maxLife = user.maxLife + 100
                user.save()
            });
            break
        case 'Apolo': //Aumento de Poder de Habilidade
            familia.levelFamilia = familia.levelFamilia + 1
            familia.nextLevel = parseInt(familia.nextLevel) + 30000
            break
    }

    //Para evitar salvamento paralelo
    setTimeout(() => {
        familia.save()
    }, 500)
}