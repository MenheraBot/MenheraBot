const database = require("../../models/rpg")
const familyDb = require("../../models/familia")
const checks = require("../../Rpgs/checks")
const {MessageEmbed} = require("discord.js")

module.exports = {
    name: "boss",
    aliases: [],
    cooldown: 3,
    category: "rpg",
    dir: 'BattleBossCommand',
    description: "Luta contra um BOSS",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
    usage: "m!boss",
    run: async (client, message, args) => {
        const user = await database.findById(message.author.id)
        if (!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro!")

        if (user.level < 20) return message.channel.send("<:negacao:759603958317711371> | Você precisa estar nível **20** para lutar contra bosses")

        const inimigo = await checks.getEnemy(user, "boss")

        const canGo = await checks.initialChecks(user, message)

        if (!canGo) return;

        const habilidades = await checks.getAbilities(user)

        if(user.uniquePower.name == "Morte Instantânea") {
            habilidades.splice(habilidades.findIndex(function (i) {
                return i.name === "Morte Instantânea"
            }), 1);
        }

        if (!inimigo) return message.channel.send("<:negacao:759603958317711371> | Essa não! Ocorreu um erro quando fui detectar qual inimigo você encontrará, desculpe por isso... Tente novamente")

        let embed = new MessageEmbed()
            .setTitle(`⌛ | Preparação pra batalha`)
            .setDescription(`Envie um **SIM** para batalhar contra um boss`)
            .setColor('#e3beff')
            .setFooter("Estas habilidades estão disponíveis para o uso")
            .addField(`Seus status atuais são`, `🩸 | **Vida:** ${user.life}/${user.maxLife}\n💧 | **Mana:** ${user.mana}/${user.maxMana}\n🗡️ | **Dano Físico:** ${user.damage + user.weapon.damage}\n🛡️ | **Armadura:** ${user.armor + user.protection.armor}\n🔮 | **Poder Mágico:** ${user.abilityPower}\n\n------HABILIDADES DISPONÍVEIS------`)
        habilidades.forEach(hab => {
            embed.addField(hab.name, `🔮 | **Dano:** ${hab.damage}\n💧 | **Custo** ${hab.cost}`)
        })
        message.channel.send(embed)

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, {
            max: 1,
            time: 30000,
            errors: ["time"]
        });

        collector.on('collect', m => {
            if (m.content.toLowerCase() != "sim") return message.channel.send(`<:negacao:759603958317711371> | Você pensou melhor, e acabou desistindo de batalhar contra bosses`)

            battle(message, inimigo, habilidades, user, "boss");
        })
    }
};

async function battle(message, inimigo, habilidades, user, type)  {

    user.dungeonCooldown = 3600000 + Date.now();
    user.inBattle = true;
    user.save()

    let options = [];

    if (user.hasFamily && user.familyName === "Loki") {
        const familia = await familyDb.findById(user.familyName)

        options.push({
            name: "Ataque Básico",
            damage: user.damage + user.weapon.damage + familia.boost.value
        })
    } else {
        options.push({
            name: "Ataque Básico",
            damage: user.damage + user.weapon.damage
        })
    }

    habilidades.forEach(hab => {
        options.push(hab)
    })

    let texto = `Você entra na batalha contra Boss, e seu inimigo é: **${inimigo.name}**, Seus status são:\n\n❤️ | Vida: **${inimigo.life}**\n⚔️ | Dano: **${inimigo.damage}**\n🛡️ | Defesa: **${inimigo.armor}**\n\nO que você faz?\n\n**OPÇÕES:**\n`

    let escolhas = []

    for (i = 0; i < options.length; i++) {
        texto += `\n**${i + 1}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`
        escolhas.push(i + 1);
    }


    let embed = new MessageEmbed()
        .setFooter("Digite no chat a opção de sua escolha")
        .setTitle("BossBattle: " + inimigo.name)
        .setColor('#f04682')
        .setDescription(texto)
    message.channel.send(message.author, embed)


    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, {
        max: 1,
        time: 15000,
        errors: ["time"]
    });

    let time = false;

    collector.on('collect', m => {
        time = true;
        const choice = Number(m.content);
        if (escolhas.includes(choice)) {
            checks.battle(message, options[choice - 1], user, inimigo, type)
        } else {
            checks.enemyShot(message, `⚔️ |  Você tentou uma técnica nova, mas não obteve sucesso! O inimigo ataca`, user, inimigo, type)
        }
    })


    setTimeout(() => {
        if (!time) {
            checks.enemyShot(message, `⚔️ |  Você demorou para tomar uma atitude, e foi atacado!`, user, inimigo, type)
        }
    }, 15000)

}


exports.continueBattle = async (message, inimigo, habilidades, user, type) => {

    let options = [];

    if (user.hasFamily && user.familyName === "Loki") {
        const familia = await familyDb.findById(user.familyName)

        options.push({
            name: "Ataque Básico",
            damage: user.damage + user.weapon.damage + familia.boost.value
        })
    } else {
        options.push({
            name: "Ataque Básico",
            damage: user.damage + user.weapon.damage
        })
    }

    habilidades.forEach(hab => {
        options.push(hab)
    })

    let damageReceived = inimigo.damage - (user.armor + user.protection.armor);
    if (damageReceived < 5) damageReceived = 5


    let texto = `**${inimigo.name}** te ataca, e causa **${damageReceived}**, atualização dos status:\n\n**SEUS STATUS**\n❤️ | Vida: **${user.life}**\n💧 | Mana: **${user.mana}**\n⚔️ | Dano: **${user.damage + user.weapon.damage}**\n🛡️ | Defesa: **${user.armor + user.protection.armor}**\n\n**STATUS DO INIMIGO**\n❤️ | Vida: **${inimigo.life}**\n⚔️ | Dano: **${inimigo.damage}**\n🛡️ | Defesa: **${inimigo.armor}**\n\nO que você faz?\n\n**OPÇÕES:**\n`

    let escolhas = []

    for (i = 0; i < options.length; i++) {
        texto += `\n**${i + 1}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`
        escolhas.push(i + 1);
    }


    let embed = new MessageEmbed()
        .setFooter("Digite no chat a opção de sua escolha")
        .setColor('#f04682')
        .setDescription(texto)
    message.channel.send(message.author, embed)


    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, {
        max: 1,
        time: 15000,
        errors: ["time"]
    });

    let time = false;

    collector.on('collect', m => {
        time = true;
        const choice = Number(m.content);
        if (escolhas.includes(choice)) {
            checks.battle(message, options[choice - 1], user, inimigo, type) //Mandar os dados de ataque, e defesa do inimigo, para fazer o calculo lá
        } else {
            checks.enemyShot(message, `⚔️ |  Você tentou uma técnica nova, mas não obteve sucesso! O inimigo ataca`, user, inimigo, type)
        }
    })


    setTimeout(() => {
        if (!time) {
            checks.enemyShot(message, `⚔️ |  Você demorou para tomar uma atitude, e foi atacado!`, user, inimigo, type)
        }
    }, 15000)

}