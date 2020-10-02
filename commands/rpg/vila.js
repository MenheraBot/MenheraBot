const { MessageEmbed } = require("discord.js");
const database = require("../../models/rpg.js");
const itemsFile = require("../../Rpgs/items.json")

module.exports = {
    name: "vila",
    aliases: ["village", "boleham"],
    cooldown: 10,
    category: "rpg",
    description: "Registre-se um aventureiro",
    usage: "m!register",
    run: async (client, message, args) => {

        const user = await database.findById(message.author.id);
        if (!user) return message.channel.send(`<:negacao:759603958317711371> | Você precisa ser um aventureiro para viajar para a vila!`)

        const validOptions = ["1", "2", "3", "4"];

        let embed = new MessageEmbed()
            .setColor('#bbfd7c')
            .setTitle("Bem-Vindo(a) a vila de Boleham!")
            .setDescription("Vá para a casa da feiticeira para comprar poções\nVá para o ferreiro para comprar armas\nVá para o hotel para descansar\nVá para a guilda para vender loots e conseguir missões")
            .addField("Opções", "1 - **Casa da Velha Feiticeira**\n2 - **Ferreiro**\n3 - **Hotel**\n4 - **Guilda**")
            .setFooter("Digite no chat para onde desejas ir")

        let msg = await message.channel.send(message.author, embed)

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

        collector.on('collect', m => {
            if (!validOptions.includes(m.content)) return message.channel.send("<:negacao:759603958317711371> | Esta opção não é válida!");

            switch (m.content) {
                case '1':
                    bruxa(message, user, msg)
                    break
                case '2':
                    ferreiro(message, user, msg)
                    break;
                case '3':
                    hotel(message, user, msg)
                    break
                case '4':
                    guilda(message, user, msg)
                    break;
            }

        })
    }
}

function bruxa(message, user, msg) {

    let itens = [];

    if (user.level < 5) {
        itemsFile.bruxa.forEach(item => {
            if (user.level >= item.minLevel && user.level < item.maxLevel) {
                itens.push(item)
            }
        })
    } else if (user.level > 4 && user.level < 10) {
        itemsFile.bruxa.forEach(item => {
            if (user.level >= item.minLevel && user.level < item.maxLevel) {
                itens.push(item)
            }
        })
    } else if (user.level > 9) {
        itemsFile.bruxa.forEach(item => {
            if (user.level >= item.minLevel && user.level < item.maxLevel) {
                itens.push(item)
            }
        })
    }

    let embed = new MessageEmbed()
        .setTitle("🏠 | Casa da Velha Feiticeira")
        .setColor('#c5b5a0')
        .setFooter("Mande no chat a sua escolha e a quantidade, exemplo: 1 3")
        .setDescription(`Suas pedras mágicas: **${user.money}** 💎`)
    let number = 0;
    itens.forEach(i => {
        number++;
        embed.addField(`---------------[ ${number} ]---------------\n${i.name}`, `📜 | **Descrição:** ${i.description}\n💎 |** Custo:** ${i.value}`)
    })

    msg.edit(message.author, embed)

    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ["time"] });

    let option = [];

    for (f = 0; f < number; f++) {
        option.push((f + 1).toString())
    }

    collector.on('collect', m => {

        const args = m.content.trim().split(/ +/g);

        if (!option.includes(args[0])) return message.channel.send("<:negacao:759603958317711371> | Esta opção não é válida!");

        let quantidade = args[1];
        if (!quantidade) quantidade = 1;

        if (quantidade < 1) return message.channel.send("<:negacao:759603958317711371> | Esta quantidade não é válida!");

        let valor;
        valor = itens[parseInt(args[0] - 1)].value * quantidade;
        if (!valor) return message.channel.send("<:negacao:759603958317711371> | Este valor não é valido");
        if (user.money < valor) return message.channel.send("<:negacao:759603958317711371> | Você não possui pedras mágicas suficientes");
        message.channel.send(`<:positivo:759603958485614652> | Você comprou **${quantidade} ${itens[parseInt(args[0] - 1)].name.slice(4)}** por **${valor}** 💎`)
        for (j = 0; j < quantidade; j++) {
            user.inventory.push(itens[parseInt(args[0] - 1)])
        }
        user.save()

    })

}

function ferreiro(message, user, msg) {

    message.channel.send('<:negacao:759603958317711371> | A casa do ferreiro está em reforma, e ele só voltará quando ela estiver pronta')

}

function hotel(message, user, msg) {

    message.channel.send('<:negacao:759603958317711371> | O hotel está em reforma! Volte outro dia')

}

async function guilda(message, user, msg) {

    let allLoots = [];
    let nameLoots = []

    user.loots.forEach(loot => {
        allLoots.push(loot)
        nameLoots.push(loot.name)
    })

    let txt = `Suas pedras mágicas: **${user.money}** 💎\n\n`;

    let embed = new MessageEmbed()
        .setTitle("🏠 | Guilda")
        .setColor('#98b849')
        .setFooter("Mande no chat a sua escolha e a quantidade, exemplo: 1 3")

    let number = 0;

    let contado = countItems(nameLoots)

    contado.forEach(i => {
        let filter = allLoots.filter(f => f.name === i.name)
        number++;
        txt += `---------------**[ ${number} ]**---------------\n<:Chest:760957557538947133> | **${i.name}** ( ${i.amount} )\n💎 | **Valor:** ${filter[0].value}\n`
    })

    embed.setDescription(txt)
    msg.edit(message.author, embed)

    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ["time"] });

    let option = [];

    for (f = 0; f < number; f++) {
        option.push((f + 1).toString())
    }

    collector.on('collect', m => {

        const args = m.content.trim().split(/ +/g);

        if (!option.includes(args[0])) return message.channel.send("<:negacao:759603958317711371> | Esta opção não é válida!");

        let quantidade = args[1];
        if (!quantidade) quantidade = 1;

        if (quantidade < 1) return message.channel.send("<:negacao:759603958317711371> | Esta quantidade não é válida!");
        if (quantidade > contado[parseInt(args[0]) - 1].amount) return message.channel.send(`<:negacao:759603958317711371> | Você não tem ${quantidade} ${contado[parseInt(args[0]) - 1].name}`);

        let filter = allLoots.filter(f => f.name === contado[parseInt(args[0]) - 1].name)
        let valor = quantidade * filter[0].value

        user.money = user.money + valor
        for (j = 0; j < quantidade; j++) {
            user.loots.splice(user.loots.findIndex(function(i){
                return i.name === contado[parseInt(args[0]) - 1].name;
            }), 1);
        }
    
        user.save()
        message.channel.send(`<:positivo:759603958485614652> | Você vendeu **${quantidade}** de **${contado[parseInt(args[0]) - 1].name}** e recebeu **${valor}** 💎`)
    })
}

function countItems(arr) {
    const countMap = {};

    for (const element of arr) {
        countMap[element] = (countMap[element] || 0) + 1;
    }

    return Object.entries(countMap).map(([value, count]) => ({
        name: value,
        amount: count
    }));
}