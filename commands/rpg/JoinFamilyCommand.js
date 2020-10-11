const { MessageEmbed } = require("discord.js");
const database = require("../../models/rpg.js");
const familyDb = require("../../models/familia.js")

module.exports = {
    name: "família",
    aliases: ["familia"],
    cooldown: 3,
    category: "rpg",
    dir: 'JoinFamilyCommand',
    description: "Registra-se em uma família",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
    usage: "m!clan [opção]",
    run: async (client, message, args) => {

        const user = await database.findById(message.author.id)
        if (!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro!")

        if(user.hasFamily) return message.channel.send(`<:negacao:759603958317711371> | Você já está na família ${user.familyName}!`)

        let embed = new MessageEmbed()
        .setTitle("Escolha sua Família!")
        .setColor("#1ff1f5")
        .setFooter("Digite no chat a opção de sua escolha")
        .setDescription("Vantagens da Família:\n• Cada família tem habilidades únicas que são desbloqueadas com investimentos na família\n• Um tipo de boost, que aumenta de acordo com os investimentos dos membros nela!\n\n**Famílias:**")
        .addFields([
            {
                name: "------------**[ 1 ]**------------",
                value: "🔱 | **Família:** Loki\n📤 | **Boost:** Dano"
            },
            {
                name: "------------**[ 2 ]**------------",
                value: "🔱 | **Família:** Ares\n📤 | **Boost:** Defesa"  
            },
            {
                name: "------------**[ 3 ]**------------",
                value: "🔱 | **Família:** Freya\n📤 | **Boost:** Mana Máxima"
            },
            {
                name: "------------**[ 4 ]**------------",
                value: "🔱 | **Família:** Soma\n📤 | **Boost:** Vida Máxima"
            },
            {
                name: "------------**[ 5 ]**------------",
                value: "🔱 | **Família:** Apolo\n📤 | **Boost:** Poder de Habilidade"
            }
        ])

        message.channel.send(embed)

        
        const validOptions = [
            {
                opção: "1",
                família: "Loki"
            },
            {
                opção: "2",
                família: "Ares"
            },
            {
                opção: "3",
                família: "Freya"
            },
            {
                opção: "4",
                família: "Soma"
            },
            {
                opção: "5",
                família: "Apolo"
            }
        ]

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, {
            max: 1,
            time: 30000,
            errors: ["time"]
        });

        collector.on('collect', async m => {

        const selectedOption = validOptions.some(so => so.opção == m.content)
        if (!selectedOption) return message.channel.send("<:negacao:759603958317711371> | Esta opção não é válida!")
        const filtredOption = validOptions.filter(f => f.opção == m.content)

        const option = filtredOption[0]

            message.channel.send(`<:positivo:759603958485614652> | Bem-Vindo à família **${option.família}**, ${message.author}! Veja seus novos Status!`)

            const familia = await familyDb.findById(option.família)

            switch(option.família){
                case 'Freya':
                    user.maxMana = user.maxMana + familia.boost.value 
                    break;
                case 'Soma':
                    user.maxLife = user.maxLife + familia.boost.value
                    break;
                case 'Apolo':
                    user.abilityPower = user.abilityPower + familia.boost.value
            }
            user.hasFamily = true
            user.familyName = option.família
            user.save()

            familia.members.push(message.author.id.toString())
            familia.save()
        })
    }
}
