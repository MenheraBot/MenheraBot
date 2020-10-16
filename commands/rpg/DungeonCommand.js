const {
    MessageEmbed
} = require("discord.js");
const database = require("../../models/rpg.js");
const familyDb = require("../../models/familia");
const checks = require("../../Rpgs/checks.js")

module.exports = {
    name: "dungeon",
    aliases: ["dungeons"],
    cooldown: 3,
    category: "rpg",
    dir: 'DungeonCommand',
    description: "Vá para uma aventura na dungeon",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
    usage: "m!dungeon",
    run: async (client, message, args) => {

        const user = await database.findById(message.author.id)
        if (!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro!")

        const inimigo = await checks.getEnemy(user, "dungeon")

        const canGo = await checks.initialChecks(user, message)

        if (!canGo) return;

        const habilidades = await checks.getAbilities(user)

        if (!inimigo) return message.channel.send("<:negacao:759603958317711371> | Essa não! Ocorreu um erro quando fui detectar qual inimigo você encontrará, desculpe por isso... Tente novamente")

        let dmgView = user.damage + user.weapon.damage
        let ptcView = user.armor + user.protection.armor

        if (user.hasFamily) {
            familia = await familyDb.findById(user.familyName)
            if (user.familyName === "Loki") dmgView = user.damage + user.weapon.damage + familia.boost.value
            if (user.familyName === "Ares") ptcView = user.armor + user.protection.armor + familia.boost.value
        }

        let embed = new MessageEmbed()
            .setTitle(`⌛ | Preparação pra batalha`)
            .setDescription(`Envie um **SIM** para adentrar na dungeon`)
            .setColor('#e3beff')
            .setFooter("Estas habilidades estão disponíveis para o uso")
            .addField(`Seus status atuais são`, `🩸 | **Vida:** ${user.life}/${user.maxLife}\n💧 | **Mana:** ${user.mana}/${user.maxMana}\n🗡️ | **Dano Físico:** ${dmgView}\n🛡️ | **Armadura:** ${ptcView}\n🔮 | **Poder Mágico:** ${user.abilityPower}\n\n------HABILIDADES DISPONÍVEIS------`)
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
            if (m.content.toLowerCase() != "sim") return message.channel.send(`<:negacao:759603958317711371> | Você pensou melhor, e acabou desistindo de entrar na dungeon`)

            battle(message, inimigo, habilidades, user, "dungeon");
        })
    }
};

async function battle(message, inimigo, habilidades, user, type) {

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

    let texto = `Você entra na Dungeon, e se depara com um monstro ${inimigo.type}: ${inimigo.name}, Seus status são:\n\n❤️ | Vida: **${inimigo.life}**\n⚔️ | Dano: **${inimigo.damage}**\n🛡️ | Defesa: **${inimigo.armor}**\n\nO que você faz?\n\n**OPÇÕES:**\n`

    let escolhas = []

    for (i = 0; i < options.length; i++) {
        texto += `\n**${i + 1}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`
        escolhas.push(i + 1);
    }


    let embed = new MessageEmbed()
        .setFooter("Digite no chat a opção de sua escolha")
        .setTitle("Inimigo Encontrado: " + inimigo.name)
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

module.exports.continueBattle = async (message, inimigo, habilidades, user, type, ataque) => {

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

    let damageReceived = ataque.damage - (user.armor + user.protection.armor);
    if (damageReceived < 5) damageReceived = 5

    let dmgView = user.damage + user.weapon.damage
    let ptcView = user.armor + user.protection.armor

    if (user.hasFamily) {
        familia = await familyDb.findById(user.familyName)
        if (user.familyName === "Loki") dmgView = user.damage + user.weapon.damage + familia.boost.value
        if (user.familyName === "Ares") ptcView = user.armor + user.protection.armor + familia.boost.value
    }

    let texto = `**${inimigo.name}** te ataca com **${ataque.name}**, e causa **${damageReceived}**, atualização dos status:\n\n**SEUS STATUS**\n❤️ | Vida: **${user.life}**\n💧 | Mana: **${user.mana}**\n⚔️ | Dano: **${dmgView}**\n🛡️ | Defesa: **${ptcView}**\n\n**STATUS DO INIMIGO**\n❤️ | Vida: **${inimigo.life}**\n⚔️ | Dano: **${inimigo.damage}**\n🛡️ | Defesa: **${inimigo.armor}**\n\nO que você faz?\n\n**OPÇÕES:**\n`

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