const Command = require("../../structures/command")
const { MessageEmbed } = require("discord.js")
module.exports = class VillageCommand extends Command {
    constructor(client) {
        super(client, {
            name: "vila",
            aliases: ["village"],
            cooldown: 10,
            category: "rpg",
            clientPermissions: ["EMBED_LINKS"]
        })
        this.itemsFile = require("../../structures/RpgHandler").items
    }
    async run({ message, args, server }, t) {

        const user = await this.client.database.Rpg.findById(message.author.id);
        if (!user) return message.menheraReply("error", t("commands:village.non-aventure"))

        const validOptions = ["1", "2", "3", "4"];

        let embed = new MessageEmbed()
            .setColor('#bbfd7c')
            .setTitle(t("commands:village.index.title"))
            .setDescription(t("commands:village.index.description"))
            .addField(t("commands:village.index.field_name"), t("commands:village.index.field_value"))
            .setFooter(t("commands:village.index.footer"))

        let msg = await message.channel.send(message.author, embed)

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

        collector.on('collect', m => {
            if (!validOptions.includes(m.content)) return message.menheraReply("error", t("commands:village.invalid-option"))

            switch (m.content) {
                case '1':
                    this.bruxa(message, user, msg, t)
                    break
                case '2':
                    this.ferreiro(message, user, msg, t)
                    break;
                case '3':
                    this.hotel(message, user, msg, t)
                    break
                case '4':
                    this.guilda(message, user, msg, t)
                    break;
            }
        })
    }
    bruxa(message, user, msg, t) {

        let itens = [];

        this.itemsFile.bruxa.forEach(item => {
            if (user.level >= item.minLevel && user.level < item.maxLevel) {
                itens.push(item)
            }
        })

        let embed = new MessageEmbed()
            .setTitle(`🏠 | ${t("commands:village.bruxa.title")}`)
            .setColor('#c5b5a0')
            .setFooter(t("commands:village.bruxa.footer"))
            .setDescription(t("commands:village.bruxa.description", { money: user.money }))
        let number = 0;
        itens.forEach(i => {
            number++;
            embed.addField(`---------------[ ${number} ]---------------\n${i.name}`, `📜 | **${t("commands:village.desc")}:** ${i.description}\n💎 |** ${t("commands:village.cost")}:** ${i.value}`)
        })

        msg.edit(message.author, embed)

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ["time"] });

        let option = [];

        for (let f = 0; f < number; f++) {
            option.push((f + 1).toString())
        }

        collector.on('collect', m => {

            const args = m.content.trim().split(/ +/g);

            if (!option.includes(args[0])) return message.menheraReply("error", t("commands:village.invalid-option"))

            let input = args[1]
            let quantidade;

            if (!input) {
                quantidade = 1
            } else quantidade = parseInt(input.replace(/\D+/g, ''));

            if (quantidade < 1) return message.menheraReply("error", t("commands:village.invalid-quantity"))

            let valor = itens[parseInt(args[0] - 1)].value * quantidade;
            if (!valor) return message.menheraReply("error", t("commands:village.invalid-value"))
            if (user.money < valor) return message.menheraReply("error", t("commands:village.poor"))
            message.menheraReply("success", t("commands:village.bruxa.bought", { quantidade, name: itens[parseInt(args[0] - 1)].name.slice(4), valor }))
            for (let j = 0; j < quantidade; j++) {
                user.inventory.push(itens[parseInt(args[0] - 1)])
            }
            user.money = user.money - valor
            user.save()
        })
    }
    ferreiro(message, user, msg, t) {

        if (user.level < 9) return message.menheraReply("error", t("commands:village.ferreiro.low-level"))

        let embed = new MessageEmbed()
            .setColor('#b99c81')
            .setTitle(`⚒️ | ${t("commands:village.ferreiro.title")}`)
            .setDescription(t("commands:village.ferreiro.description"))
            .addField(t("commands:village.ferreiro.field_name"), t("commands:village.ferreiro.field_value"))
            .setFooter(t("commands:village.ferreiro.footer"))

        msg.edit(message.author, embed)

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1 });

        collector.on('collect', m => {

            if (m.content === "1") {
                this.ferreiroArma(message, user, msg, t)
            } else if (m.content === "2") {
                this.ferreiroArmadura(message, user, msg, t)
            } else return message.menheraReply("error", t("commands:village.invalid-option"))

        })
    }
    ferreiroArma(message, user, msg, t) {
        let embed = new MessageEmbed()
            .setColor('#b99c81')
            .setTitle(`⚒️ | ${t("commands:village.ferreiro.title")}`)
            .setDescription(`<:atencao:759603958418767922> | ${t("commands:village.ferreiro.arma.description")}`)
            .addFields([{
                name: `1 - ${t("commands:village.ferreiro.arma.lança")}`,
                value: `🗡️ | ${t("commands:village.ferreiro.dmg")}: **17**\n💎 | ${t("commands:village.ferreiro.cost")}: **500**\n<:Chest:760957557538947133> | ${t("commands:village.ferreiro.itens-needed")}: **2 Presas de Lobisomem**`
            },
            {
                name: `2 - ${t("commands:village.ferreiro.arma.espada")}`,
                value: `🗡️ | ${t("commands:village.ferreiro.dmg")}: **27**\n💎 | ${t("commands:village.ferreiro.cost")}: **950**\n<:Chest:760957557538947133> | ${t("commands:village.ferreiro.itens-needed")}: **2 Chifres de Minotauro**`
            }
            ])
            .setFooter(t("commands:village.ferreiro.arma.footer"))

        msg.edit(message.author, embed)

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1 });

        let nameLoots = []

        user.loots.forEach(loot => {
            nameLoots.push(loot.name)
        })

        let contado = countItems(nameLoots)

        let filtrado = contado.filter(f => f.name === "Presas de Lobisomem")
        let filtrado1 = contado.filter(f => f.name === "Chifre de Minotauro")

        collector.on('collect', m => {

            if (m.content === "1") {
                if (user.money < 500) return message.menheraReply("error", t("commands:village.poor"))
                if (!filtrado[0]) return message.menheraReply("error", `${t("commands:village.ferreiro.poor", { value: 2 })} Presas de Lobisomem`)
                if (filtrado[0].amount < 2) return message.menheraReply("error", `${t("commands:village.ferreiro.poor", { value: 2 })} Presas de Lobisomem`)

                user.weapon = {
                    name: "Lança de Presas de Lobisomem",
                    damage: 17
                }
                user.money = user.money - 500
                for (let j = 0; j < 2; j++) {
                    user.loots.splice(user.loots.findIndex(function (i) {
                        return i.name === filtrado[0].name;
                    }), 1);
                }

                user.save()
                message.menheraReply("success", t("commands:village.ferreiro.arma.change", { arma: "Lança de Presas de Lobisomem" }))

            } else if (m.content === "2") {
                if (user.money < 950) return message.menheraReply("error", t("commands:village.poor"))
                if (!filtrado1[0]) return message.menheraReply("error", `${t("commands:village.ferreiro.arma.poor", { value: 2 })} Chifres de Minotauro`)
                if (filtrado1[0].amount < 2) return message.menheraReply("error", `${t("commands:village.ferreiro.arma.poor", { value: 2 })} Chifres de Minotauro`)

                user.weapon = {
                    name: "Espada de Chifre de Minotauro",
                    damage: 27
                }
                user.money = user.money - 950
                for (let j = 0; j < 2; j++) {
                    user.loots.splice(user.loots.findIndex(function (i) {
                        return i.name === filtrado1[0].name;
                    }), 1);
                }

                user.save()
                message.menheraReply("success", t("commands:village.ferreiro.arma.change", { arma: "Espada de Chifre de Minotauro" }))

            } else return message.menheraReply("error", t("commands:village.invalid-option"))
        })
    }
    ferreiroArmadura(message, user, msg, t) {

        let embed = new MessageEmbed()
            .setColor('#b99c81')
            .setTitle(`⚒️ | ${t("commands:village.ferreiro.title")}`)
            .setDescription(`<:atencao:759603958418767922> | ${t("commands:village.ferreiro.armadura.description")}`)
            .addFields([{
                name: `1 - ${t("commands:village.ferreiro.armadura.reforçado")}`,
                value: `🛡️ | ${t("commands:village.ferreiro.prt")}: **10**\n💎 | ${t("commands:village.ferreiro.cost")}: **400**\n<:Chest:760957557538947133> | ${t("commands:village.ferreiro.itens-needed")}: **1 Pele de Lobisomem**`
            },
            {
                name: `2 - ${t("commands:village.ferreiro.armadura.perfeito")}`,
                value: `🛡️ | ${t("commands:village.ferreiro.prt")}: **30**\n💎 | ${t("commands:village.ferreiro.cost")}: **1000**\n<:Chest:760957557538947133> | ${t("commands:village.ferreiro.itens-needed")}: **3 Pele de Lobisomem**`
            }
            ])
            .setFooter(t("commands:village.ferreiro.footer"))

        msg.edit(message.author, embed)

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1 });

        let nameLoots = []

        user.loots.forEach(loot => {
            nameLoots.push(loot.name)
        })

        let contado = countItems(nameLoots)

        let filtrado = contado.filter(f => f.name === "Pele de Lobisomem")

        collector.on('collect', m => {

            if (m.content === "1") {
                if (user.money < 400) return message.menheraReply("error", t("commands:village.poor"))
                if (!filtrado[0]) return message.menheraReply("error", `${t("commands:village.ferreiro.armadura.poor", { value: 1 })} Pele de Lobisomem`)
                if (filtrado[0].amount < 1) return message.menheraReply("error", `${t("commands:village.ferreiro.armadura.poor", { value: 1 })} Pele de Lobisomem`)

                user.protection = {
                    name: "Peitoral Reforçado",
                    armor: 10
                }
                user.money = user.money - 400
                for (let j = 0; j < 1; j++) {
                    user.loots.splice(user.loots.findIndex(function (i) {
                        return i.name === filtrado[0].name;
                    }), 1);
                }

                user.save()
                message.menheraReply("success", t("commands:village.ferreiro.armadura.change", { armadura: "Peitoral Reforçado" }))

            } else if (m.content === "2") {
                if (user.money < 1000) return message.menheraReply("error", t("commands:village.poor"))
                if (!filtrado[0]) return message.menheraReply("error", `${t("commands:village.ferreiro.armadura.poor", { value: 3 })} Peles de Lobisomem`)
                if (filtrado[0].amount < 3) return message.menheraReply("error", `${t("commands:village.ferreiro.armadura.poor", { value: 3 })} Peles de Lobisomem`)

                user.protection = {
                    name: "Peitoral Perfeito",
                    armor: 30
                }
                user.money = user.money - 1000
                for (let j = 0; j < 3; j++) {
                    user.loots.splice(user.loots.findIndex(function (i) {
                        return i.name === filtrado[0].name;
                    }), 1);
                }

                user.save()
                message.menheraReply("success", t("commands:village.ferreiro.armadura.change", { armadura: "Peitoral Perfeito" }))

            } else return message.menheraReply("error", t("commands:village.invalid-option"))
        })
    }
    hotel(message, user, msg, t) {

        let embed = new MessageEmbed()
            .setTitle(`🏨 | ${t("commands:village.hotel.title")}`)
            .setDescription(t("commands:village:hotel.description"))
            .addFields([{
                name: `1 - ${t("commands:village.hotel.fields.name_one")}`,
                value: `⌛ | ${t("commands:village.hotel.fields.value", { time: 2, life: 40, mana: 30 })}`
            },
            {
                name: `2 - ${t("commands:village.hotel.fields.two")}`,
                value: `⌛ | ${t("commands:village.hotel.fields.value", { time: "3,5", life: "MAX", mana: 0 })}`
            },
            {
                name: `3 - ${t("commands:village.hotel.fields.name_three")}`,
                value: `⌛ | ${t("commands:village.hotel.fields.value", { time: "3,5", life: 0, mana: "MAX" })}`
            },
            {
                name: `4 - ${t("commands:village.hotel.fields.name_four")}`,
                value: `⌛ | ${t("commands:village.hotel.fields.value", { time: "7", life: "MAX", mana: "MAX" })}`
            }
            ])
            .setFooter(t("commands:village.hotel.footer"))
            .setColor('#e7a8ec')

        msg.edit(message.author, embed)

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

        let validOptions = ["1", "2", "3", "4"];

        collector.on('collect', m => {

            if (!validOptions.includes(m.content)) return message.menheraReply("error", t("commands:village.invalid-option"))

            if (user.hotelTime > Date.now()) return message.menheraReply("error", t("commands:village.hotel.already"))

            if (user.life < 1 && user.death > Date.now()) return message.menheraReply("error", t("commands:village.hotel.dead"))

            if (m.content == "1") {
                user.hotelTime = 7200000 + Date.now()
                user.life = user.life + 40
                user.mana = user.mana + 30
            } else if (m.content == "2") {
                user.hotelTime = 12600000 + Date.now()
                user.life = user.maxLife
            } else if (m.content == "3") {
                user.hotelTime = 12600000 + Date.now()
                user.mana = user.maxMana
            } else if (m.content == "4") {
                user.hotelTime = 25200000 + Date.now()
                user.life = user.maxLife
                user.mana = user.maxMana
            }

            if (user.life > user.maxLife) user.life = user.maxLife
            if (user.mana > user.maxMana) user.mana = user.maxMana

            user.save()

            message.menheraReply("success", t("commands:village.hotel.done"))
        })
    }
    guilda(message, user, msg, t) {

        let allLoots = [];
        let nameLoots = []

        user.loots.forEach(loot => {
            allLoots.push(loot)
            nameLoots.push(loot.name)
        })

        let txt = t("commands:village.guilda.money", { money: user.money }) + t("commands:village.guilda.sell-all");

        let embed = new MessageEmbed()
            .setTitle(`🏠 | ${t("commands:village.guilda.title")}`)
            .setColor('#98b849')
            .setFooter(t("commands:village.guilda.footer"))

        let number = 0;

        let contado = countItems(nameLoots)

        contado.forEach(i => {
            let filter = allLoots.filter(f => f.name === i.name)
            number++;
            txt += `---------------**[ ${number} ]**---------------\n<:Chest:760957557538947133> | **${i.name}** ( ${i.amount} )\n💎 | **${t("commands:village.guilda.value")}:** ${filter[0].value}\n`
        })

        let texto = (txt.length > 1800) ? `${txt.slice(0, 1800)}...` : txt;

        embed.setDescription(texto)

        if (contado.length == 0) return msg.edit(message.author, embed.setDescription(t("commands:village.guilda.no-loots")).setFooter("No Looots!").setColor("#f01010"))

        msg.edit(message.author, embed)

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

        let option = [];

        for (let f = 0; f < number; f++) {
            option.push((f).toString())
        }

        collector.on('collect', m => {

            const args = m.content.trim().split(/ +/g);

            if (!option.includes(args[0])) return message.menheraReply("error", t("commands:village.invalid-option"))

            if (args[0] == "0") {

                let totalValue = 0;
                let totalItems = 0;

                allLoots.forEach(l => {
                    totalValue = totalValue + l.value
                    totalItems++;
                })

                message.menheraReply("success", t("commands:village.guilda.sold-all", {amount: totalItems, value: totalValue}))

                user.loots = [];
                user.money = user.money + totalValue
                user.save()

            } else {

                let input = args[1]
                let quantidade;

                if (!input) {
                    quantidade = 1
                } else quantidade = parseInt(input.replace(/\D+/g, ''));

                if (quantidade < 1) return message.menheraReply("error", t("commands:village.invalid-quantity"))
                if (quantidade > contado[parseInt(args[0]) - 1].amount) return message.menheraReply("error", `${t("commands:village.guilda.poor")} ${quantidade} ${contado[parseInt(args[0]) - 1].name}`);

                let filter = allLoots.filter(f => f.name === contado[parseInt(args[0]) - 1].name)
                let valor = parseInt(quantidade) * parseInt(filter[0].value)
                if (isNaN(valor)) return message.menheraReply("error", t("commands:village.guilda.unespected-error"))

                user.money = user.money + parseInt(valor)
                for (let j = 0; j < quantidade; j++) {
                    user.loots.splice(user.loots.findIndex(function (i) {
                        return i.name === contado[parseInt(args[0]) - 1].name;
                    }), 1);
                }

                user.save()
                message.menheraReply("success", t("commands:village.guilda.sold", { quantity: quantidade, name: contado[parseInt(args[0]) - 1].name, value: valor }))
            }
        })
    }
}

function countItems(arr) {
    const countMap = {};

    for (const element of arr) {
        countMap[element] = (countMap[element] || 0) + 1;
    }
    return Object.entries(countMap).map(([value, count]) => ({
        name: value,
        amount: count
    })
    );
}