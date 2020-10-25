
const moment = require("moment")
const mobsFile = require("../RpgHandler").mobs
const abilitiesFile = require("../RpgHandler").abiltiies
const { MessageEmbed } = require("discord.js")

module.exports.getEnemy = async (user, type) => {

    let initialEnemy = [];
    let mediumEnemy = [];
    let hardEnemy = [];
    let impossibleEnemy = [];

    let monstro;

    if (type == "boss") {
        let bosses = []
        mobsFile.boss.forEach(b => {
            bosses.push(b)
        })
        monstro = await bosses[Math.floor(Math.random() * bosses.length)];

        return monstro;
    }

    mobsFile.inicial.forEach(initialMob => {
        initialEnemy.push(initialMob)
    })

    mobsFile.medio.forEach(mediumMob => {
        mediumEnemy.push(mediumMob)
    })

    mobsFile.hard.forEach(hardMob => {
        hardEnemy.push(hardMob)
    })

    mobsFile.impossible.forEach(impMob => {
        impossibleEnemy.push(impMob)
    })

    if (user.level < 5) {
        monstro = await initialEnemy[Math.floor(Math.random() * initialEnemy.length)];
    } else if (user.level > 4 && user.level < 10) {
        monstro = await mediumEnemy[Math.floor(Math.random() * mediumEnemy.length)];
    } else if (user.level > 9 && user.level < 13) {
        monstro = await hardEnemy[Math.floor(Math.random() * hardEnemy.length)];
    } else if (user.level > 12) {
        monstro = await impossibleEnemy[Math.floor(Math.random() * impossibleEnemy.length)];
    }
    return monstro;
}

module.exports.battle = async (message, escolha, user, inimigo, type, familia, t) => {

    let danoUser;
    if (escolha.name == "Ataque Básico" || escolha.name == "Basic Attack") {
        danoUser = escolha.damage
    } else if (escolha.name == "Morte Instantânea") {
        if (user.mana < user.maxMana) return this.enemyShot(message, `⚔️ | ${t("roleplay:battle.no-mana", { name: escolha.name })}`, user, inimigo, type, familia, t)
        danoUser = escolha.damage * user.abilityPower;
        user.mana = 0;
    } else {

        if (user.mana < escolha.cost) return this.enemyShot(message, `⚔️ | ${t("roleplay:battle.no-mana", { name: escolha.name })}`, user, inimigo, type, familia, t)
        if (escolha.heal > 0) {
            user.life = user.life + escolha.heal
            if (user.life > user.maxLife) user.life = user.maxLife
        }
        danoUser = escolha.damage * user.abilityPower;
        user.mana = user.mana - escolha.cost
    }

    setTimeout(() => {
        let enemyArmor = inimigo.armor
        let danoDado = danoUser - enemyArmor;
        if (escolha.name == "Ataque Básico" || escolha.name == "Basic Attack") danoDado = danoUser
        if (danoDado < 0) danoDado = 0;
        let vidaInimigo = inimigo.life - danoDado;

        message.menheraReply("sword", t("roleplay:battle.attack", { enemy: inimigo.name, choice: escolha.name, damage: danoDado }))

        if (vidaInimigo < 1) return user.save().then(() => this.resultBattle(message, user, inimigo, t))

        const enemy = {
            name: inimigo.name,
            damage: inimigo.damage,
            life: vidaInimigo,
            armor: inimigo.armor,
            loots: inimigo.loots,
            xp: inimigo.xp,
            ataques: inimigo.ataques
        }

        user.save().then(() => this.enemyShot(message, "", user, enemy, type, familia, t))
    }, 500)
}

module.exports.morte = async (message, user, t) => {

    message.menheraReply("error", t("roleplay:death"))
    user.death = Date.now() + 43200000;
    user.life = 0
    user.inBattle = false
    user.save()
}

module.exports.enemyShot = async (message, text, user, inimigo, type, familia, t) => {

    const habilidades = await this.getAbilities(user, familia)

    if (text.length > 0) message.channel.send(text)

    let danoRecebido
    let armadura = user.armor + user.protection.armor

    if (user.hasFamily) {
        if (user.familyName === "Ares") {
            armadura = user.armor + user.protection.armor + familia.boost.value
        }
    }

    let ataque = await inimigo.ataques[Math.floor(Math.random() * inimigo.ataques.length)];

    if ((ataque.damage - armadura) < 5) {
        danoRecebido = 5;
    } else {
        danoRecebido = ataque.damage - armadura
    }
    let vidaUser = user.life - danoRecebido;

    if (vidaUser < 1) {
        return this.morte(message, user, t)
    } else {
        user.life = vidaUser
        user.save().then(() => this.continueBattle(message, inimigo, habilidades, user, type, ataque, familia, t))
    }
}

module.exports.continueBattle = async (message, inimigo, habilidades, user, type, ataque, familia, t) => {

    let options = [];

    if (user.hasFamily && user.familyName === "Loki") {

        options.push({
            name: t("roleplay:basic-attack"),
            damage: user.damage + user.weapon.damage + familia.boost.value
        })
    } else {
        options.push({
            name: t("roleplay:basic-attack"),
            damage: user.damage + user.weapon.damage
        })
    }

    if (type == "boss") {
        if (user.uniquePower.name == "Morte Instantânea") {
            habilidades.splice(habilidades.findIndex(function (i) {
                return i.name === "Morte Instantânea"
            }), 1);
        }
    }
    habilidades.forEach(hab => {
        options.push(hab)
    })

    let dmgView = user.damage + user.weapon.damage
    let ptcView = user.armor + user.protection.armor

    if (user.hasFamily) {
        if (user.familyName === "Loki") dmgView = user.damage + user.weapon.damage + familia.boost.value
        if (user.familyName === "Ares") ptcView = user.armor + user.protection.armor + familia.boost.value
    }

    let damageReceived = ataque.damage - ptcView;
    if (damageReceived < 5) damageReceived = 5

    let texto = t("roleplay:battle.text", { enemy: inimigo.name, attack: ataque.name, dmg: damageReceived, life: user.life, mana: user.mana, damage: dmgView, armor: ptcView, elife: inimigo.life, edmg: inimigo.damage, earmor: inimigo.armor })

    let escolhas = []

    for (var i = 0; i < options.length; i++) {
        texto += `\n**${i + 1}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`
        escolhas.push(i + 1);
    }

    let embed = new MessageEmbed()
        .setFooter(t("roleplay:battle.footer"))
        .setColor('#f04682')
        .setDescription(texto)
    message.channel.send(message.author, embed)

    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ["time"] });

    let time = false;

    collector.on('collect', m => {
        time = true;
        const choice = Number(m.content);
        if (escolhas.includes(choice)) {
            this.battle(message, options[choice - 1], user, inimigo, type, familia, t) //Mandar os dados de ataque, e defesa do inimigo, para fazer o calculo lá
        } else {
            this.enemyShot(message, `⚔️ |  ${t("roleplay:battle.new-tatic")}`, user, inimigo, type, familia, t)
        }
    })

    setTimeout(() => {
        if (!time) {
            this.enemyShot(message, `⚔️ | ${t("roleplay:battle.timeout")}`, user, inimigo, type, familia, t)
        }
    }, 15000)
}

module.exports.finalChecks = async (message, user, t) => {

    let texto = "";

    if (user.level < 5) {
        if (user.xp >= user.nextLevelXp) {
            user.xp = 0;
            user.nextLevelXp = user.nextLevelXp * 2;
            user.level = user.level + 1
            user.maxLife = user.maxLife + 10
            user.maxMana = user.maxMana + 10
            user.damage = user.damage + 3
            user.armor = user.armor + 2
            user.save().then(() => {
                texto += `**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**`
                message.channel.send(texto)
                if (user.level === 5) this.newAbilities(message, user, t)
            })
        }
    } else if (user.level > 4 && user.level < 10) {
        if (user.xp >= user.nextLevelXp) {
            user.nextLevelXp = user.nextLevelXp * 2;
            user.level = user.level + 1
            user.maxLife = user.maxLife + 20
            user.maxMana = user.maxMana + 15
            user.damage = user.damage + 5
            user.armor = user.armor + 3
            texto += `**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**`
            message.channel.send(texto)
            user.save().then(() => this.newAbilities(message, user, t))
        }
    } else if (user.level > 9) {
        if (user.xp >= user.nextLevelXp) {
            user.nextLevelXp = user.nextLevelXp * 2;
            user.level = user.level + 1
            user.maxLife = user.maxLife + 50
            user.maxMana = user.maxMana + 20
            user.damage = user.damage + 7
            user.armor = user.armor + 5
            texto += `**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**`
            message.channel.send(texto)
            user.save().then(() => this.newAbilities(message, user, t))
        }
    }
}

module.exports.newAbilities = async (message, user, t) => {

    if (user.level == 5) {
        switch (user.class) {
            case 'Assassino':
                user.abilities.push(abilitiesFile.assassin.normalAbilities[1])
                user.maxMana = user.maxMana + 20
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.assassin.normalAbilities[1].name }))
                break;
            case 'Bárbaro':
                user.abilities.push(abilitiesFile.barbarian.normalAbilities[1])
                user.maxLife = user.maxLife + 20
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.barbarian.normalAbilities[1].name }))
                break;
            case 'Clérigo':
                user.abilities.push(abilitiesFile.clerigo.normalAbilities[1])
                user.abilityPower = user.abilityPower + 1
                user.maxMana = user.maxMana + 20
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.clerigo.normalAbilities[1].name }))
                break;
            case 'Druida':
                user.abilities.push(abilitiesFile.druida.normalAbilities[1])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.druida.normalAbilities[1].name }))
                break;
            case 'Espadachim':
                user.abilities.push(abilitiesFile.espadachim.normalAbilities[1])
                user.abilityPower = user.abilityPower + 2
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.espadachim.normalAbilities[1].name }))
                break;
            case 'Feiticeiro':
                if (user.uniquePower.name == "Linhagem: Mística") {
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[1])
                    user.maxMana = user.maxMana + 20
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[1].name }))
                }
                if (user.uniquePower.name == "Linhagem: Dracônica") {
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[2])
                    user.maxMana = user.maxMana + 20
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[2].name }))
                }
                if (user.uniquePower.name == "Linhagem: Demoníaca") {
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[3])
                    user.maxMana = user.maxMana + 20
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[3].name }))
                }
                break;
            case 'Monge':
                user.abilities.push(abilitiesFile.monge.normalAbilities[1])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.monge.normalAbilities[1].name }))
                break;
            case 'Necromante':
                user.abilities.push(abilitiesFile.necromante.normalAbilities[1])
                user.maxMana = user.maxMana + 20
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.necromante.normalAbilities[1].name }))
                break;
        }

    } else if (user.level == 10) {
        message.menheraReply("success", t("roleplay:family"))
        switch (user.class) {
            case 'Assassino':
                user.abilities.push(abilitiesFile.assassin.normalAbilities[2])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.assassin.normalAbilities[2].name }))
                break;
            case 'Bárbaro':
                user.abilities.push(abilitiesFile.barbarian.normalAbilities[2])
                user.maxLife = user.maxLife + 50
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.barbarian.normalAbilities[2].name }))
                break;
            case 'Clérigo':
                user.abilities.push(abilitiesFile.clerigo.normalAbilities[2])
                user.abilityPower = user.abilityPower + 1
                user.maxMana = user.maxMana + 20
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.clerigo.normalAbilities[2].name }))
                break;
            case 'Druida':
                user.abilities.push(abilitiesFile.druida.normalAbilities[2])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.druida.normalAbilities[2].name }))
                break;
            case 'Espadachim':
                user.abilities.push(abilitiesFile.espadachim.normalAbilities[2])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.espadachim.normalAbilities[2].name }))
                break;
            case 'Feiticeiro':
                if (user.uniquePower.name == "Linhagem: Mística") {
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[4])
                    user.maxMana = user.maxMana + 25
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[4].name }))
                }
                if (user.uniquePower.name == "Linhagem: Dracônica") {
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[5])
                    user.maxMana = user.maxMana + 25
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[5].name }))
                }
                if (user.uniquePower.name == "Linhagem: Demoníaca") {
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[6])
                    user.maxMana = user.maxMana + 25
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[6].name }))
                }
                break;
            case 'Monge':
                user.abilities.push(abilitiesFile.monge.normalAbilities[2])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.monge.normalAbilities[2].name }))
                break;
            case 'Necromante':
                user.abilities.push(abilitiesFile.necromante.normalAbilities[2])
                user.maxMana = user.maxMana + 25
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.necromante.normalAbilities[2].name }))
                break;
        }
    } else if (user.level == 14) {
        switch (user.class) {
            case 'Assassino':
                user.abilities.push(abilitiesFile.assassin.normalAbilities[3])
                user.abilityPower = user.abilityPower + 1
                user.damage = user.damage + 10
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.assassin.normalAbilities[3].name }))
                break;
            case 'Bárbaro':
                user.abilities.push(abilitiesFile.barbarian.normalAbilities[3])
                user.maxLife = user.maxLife + 50
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.barbarian.normalAbilities[3].name }))
                break;
            case 'Clérigo':
                user.abilities.push(abilitiesFile.clerigo.normalAbilities[3])
                user.abilityPower = user.abilityPower + 1
                user.maxMana = user.maxMana + 40
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.clerigo.normalAbilities[3].name }))
                break;
            case 'Druida':
                user.abilities.push(abilitiesFile.druida.normalAbilities[3])
                user.abilityPower = user.abilityPower + 1
                user.maxMana = user.maxMana + 30
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.druida.normalAbilities[3].name }))
                break;
            case 'Espadachim':
                user.abilities.push(abilitiesFile.espadachim.normalAbilities[3])
                user.abilityPower = user.abilityPower + 1
                user.damage = user.damage + 10
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.espadachim.normalAbilities[3].name }))
                break;
            case 'Feiticeiro':
                if (user.uniquePower.name == "Linhagem: Mística") {
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[7])
                    user.maxMana = user.maxMana + 40
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[7].name }))
                }
                if (user.uniquePower.name == "Linhagem: Dracônica") {
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[8])
                    user.maxMana = user.maxMana + 40
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[8].name }))
                }
                if (user.uniquePower.name == "Linhagem: Demoníaca") {
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[9])
                    user.maxMana = user.maxMana + 40
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[9].name }))
                }
                break;
            case 'Monge':
                user.abilities.push(abilitiesFile.monge.normalAbilities[3])
                user.abilityPower = user.abilityPower + 2
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.monge.normalAbilities[3].name }))
                break;
            case 'Necromante':
                user.abilities.push(abilitiesFile.necromante.normalAbilities[3])
                user.maxMana = user.maxMana + 40
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.menheraReply("level", t("roleplay:new-ability", { level: user.level, ability: abilitiesFile.necromante.normalAbilities[3].name }))
                break;
        }
    } else if (user.level == 16) {
        user.xp = 0
        user.nextLevelXp = 100000
        user.save()
    } else if (user.level == 20) {
        user.xp = 0
        user.nextLevelXp = 1000000
        user.save()
        message.menheraReply("warn", t("roleplay:boss"))
    }
}

module.exports.resultBattle = async (message, user, inimigo, t) => {

    const randomLoot = inimigo.loots[Math.floor(Math.random() * inimigo.loots.length)];

    const embed = new MessageEmbed()
        .setTitle(`⚔️ | ${t("roleplay:result.title")}`)
        .setDescription(t("roleplay:result.description", { enemy: inimigo.name }))
        .setColor("#4cf74b")
        .addFields([{
            name: "🔰 | XP",
            value: inimigo.xp,
            inline: true
        },
        {
            name: `<:Chest:760957557538947133> | ${t("roleplay:result.loots")}`,
            value: randomLoot.name,
            inline: true
        }
        ])

    message.channel.send(message.author, embed)
    user.xp = user.xp + inimigo.xp;
    user.loots.push(randomLoot)
    user.inBattle = false;
    user.save().then(() => this.finalChecks(message, user, t))
}

module.exports.getAbilities = async (user, familia) => {

    let abilities = [];

    let filtrado;

    switch (user.class) {
        case 'Assassino':
            filtrado = abilitiesFile.assassin
            break;
        case 'Bárbaro':
            filtrado = abilitiesFile.barbarian
            break;
        case 'Clérigo':
            filtrado = abilitiesFile.clerigo
            break;
        case 'Druida':
            filtrado = abilitiesFile.druida
            break;
        case 'Espadachim':
            filtrado = abilitiesFile.espadachim
            break;
        case 'Feiticeiro':
            filtrado = abilitiesFile.feiticeiro
            break;
        case 'Monge':
            filtrado = abilitiesFile.monge
            break;
        case 'Necromante':
            filtrado = abilitiesFile.necromante
            break;
    }

    let uniquePowerFiltred = filtrado.uniquePowers.filter(f => f.name == user.uniquePower.name)
    let abilitiesFiltred = []

    user.abilities.forEach(hab => {
        let a = filtrado.normalAbilities.filter(f => f.name == hab.name)
        abilitiesFiltred.push(a[0])
    })

    abilities.push(uniquePowerFiltred[0])

    abilitiesFiltred.forEach(hab => {
        abilities.push(hab)
    })

    if (user.hasFamily) {
        familia.abilities.forEach(habF => {
            abilities.push(habF)
        })
    }

    return abilities;
}

module.exports.initialChecks = async (user, message, t) => {

    let pass = true
    let motivo = [];

    if (user.life < 1) {
        if (Date.now() > parseInt(user.death)) {
            user.life = user.maxLife
            user.mana = user.maxMana
        }
    }
    if (user.life < 1) {
        pass = false
        motivo.push({
            name: `💔 | ${t("roleplay:initial.no-life")}`,
            value: t("roleplay:initial.no-life-text", { time: (parseInt(user.death - Date.now()) > 3600000) ? moment.utc(parseInt(user.death - Date.now())).format("HH:mm:ss") : moment.utc(parseInt(user.death - Date.now())).format("mm:ss") })
        })
    }
    if (user.dungeonCooldown > Date.now()) {
        pass = false
        motivo.push({
            name: `💤 | ${t("roleplay:initial.tired")}`,
            value: t("roleplay:initial.tired-text", { time: moment.utc(parseInt(user.dungeonCooldown - Date.now())).format("mm:ss") })
        })
    }

    if (parseInt(user.hotelTime) > Date.now()) {
        pass = false
        motivo.push({
            name: "🏨 | Hotel",
            value: t("roleplay:initial.hotel-text", { time: (parseInt(user.hotelTime - Date.now()) > 3600000) ? moment.utc(parseInt(user.hotelTime - Date.now())).format("HH:mm:ss") : moment.utc(parseInt(user.hotelTime - Date.now())).format("mm:ss") })
        })
    }

    if (!pass) {
        let texto = `<:negacao:759603958317711371> | ${t("roleplay:initial.cant-go")}`;
        motivo.forEach(m => {
            texto += `\n**${m.name}:** ${m.value}`
        })
        message.channel.send(texto)
    }
    return user.save().then(() => pass)
}

module.exports.confirmRegister = async (user, message, t) => {

    setTimeout(() => {
        switch (user.class) {
            case 'Assassino':
                const unicPowersAssassin = abilitiesFile.assassin.uniquePowers
                const choiceAssassin = unicPowersAssassin[Math.floor(Math.random() * unicPowersAssassin.length)];
                user.armor = 5;
                user.damage = 25;
                user.mana = 20;
                user.maxMana = 20;
                user.abilityPower = 1;
                user.abilities.push(abilitiesFile.assassin.normalAbilities[0])
                user.weapon = {
                    name: "Adaga",
                    damage: 5,
                    type: "Arma"
                }
                user.uniquePower = choiceAssassin
                user.save()
                message.menheraReply("success", t("roleplay:registred"))
                break;
            case 'Bárbaro':
                const unicPowersBarbaro = abilitiesFile.barbarian.uniquePowers
                const choiceBarbaro = unicPowersBarbaro[Math.floor(Math.random() * unicPowersBarbaro.length)];
                user.armor = 20;
                user.damage = 15
                user.mana = 20
                user.maxMana = 20;
                user.abilityPower = 1;
                user.abilities.push(abilitiesFile.barbarian.normalAbilities[0])
                user.weapon = {
                    name: "Machado de dois Gumes",
                    damage: 10,
                    type: "Arma"
                }
                user.uniquePower = choiceBarbaro;
                user.save()
                message.menheraReply("success", t("roleplay:registred"))
                break;
            case 'Druida':
                const unicPowersDruida = abilitiesFile.druida.uniquePowers
                const choiceDruida = unicPowersDruida[Math.floor(Math.random() * unicPowersDruida.length)];
                user.armor = 10;
                user.damage = 7;
                user.mana = 50;
                user.maxMana = 50;
                user.abilityPower = 3;
                user.abilities.push(abilitiesFile.druida.normalAbilities[0])
                user.weapon = {
                    name: "Anel da Transformação",
                    damage: 0,
                    type: "Arma"
                }
                user.uniquePower = choiceDruida;
                user.save()
                message.menheraReply("success", t("roleplay:registred"))
                break;
            case 'Espadachim':
                const unicPowersEspadachim = abilitiesFile.espadachim.uniquePowers
                const choiceEspadachim = unicPowersEspadachim[Math.floor(Math.random() * unicPowersEspadachim.length)];
                user.armor = 17;
                user.damage = 18,
                    user.mana = 20;
                user.maxMana = 20;
                user.abilityPower = 1;
                user.abilities.push(abilitiesFile.espadachim.normalAbilities[0])
                user.weapon = {
                    name: "Sabre",
                    damage: 7,
                    type: "Arma"
                }
                user.uniquePower = choiceEspadachim
                user.save()
                message.menheraReply("success", t("roleplay:registred"))
                break;
            case 'Feiticeiro':
                const unicPowersFeiticeiro = abilitiesFile.feiticeiro.uniquePowers
                const choiceFeiticeiro = unicPowersFeiticeiro[Math.floor(Math.random() * unicPowersFeiticeiro.length)];
                user.armor = 7
                user.damage = 5
                user.mana = 60
                user.maxMana = 60;
                user.abilityPower = 4
                user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[0])
                user.weapon = {
                    name: "Cajado",
                    damage: 5,
                    type: "Arma"
                }
                user.uniquePower = choiceFeiticeiro
                user.save()
                message.menheraReply("success", t("roleplay:registred"))
                break;
            case 'Clérigo':
                const unicPowersClerigo = abilitiesFile.clerigo.uniquePowers
                const choiceClerigo = unicPowersClerigo[Math.floor(Math.random() * unicPowersClerigo.length)];
                user.armor = 10
                user.damage = 4
                user.mana = 60
                user.maxMana = 60;
                user.abilityPower = 4
                user.abilities.push(abilitiesFile.clerigo.normalAbilities[0])
                user.weapon = {
                    name: "Tomo Sagrado",
                    damage: 5,
                    type: "Arma"
                }
                user.uniquePower = choiceClerigo
                user.save()
                message.menheraReply("success", t("roleplay:registred"))
                break;
            case 'Monge':
                const unicPowersMonge = abilitiesFile.monge.uniquePowers
                const choiceMonge = unicPowersMonge[Math.floor(Math.random() * unicPowersMonge.length)];
                user.armor = 18
                user.damage = 14
                user.mana = 20
                user.maxMana = 20;
                user.abilityPower = 2
                user.abilities.push(abilitiesFile.monge.normalAbilities[0])
                user.uniquePower = choiceMonge
                user.weapon = {
                    name: "Punhos",
                    damage: 1,
                    type: "Arma"
                }
                user.save()
                message.menheraReply("success", t("roleplay:registred"))
                break;
            case 'Necromante':
                const unicPowerNecromante = abilitiesFile.necromante.uniquePowers
                const choiceNecromante = unicPowerNecromante[Math.floor(Math.random() * unicPowerNecromante.length)];
                user.armor = 7
                user.damage = 5
                user.mana = 60
                user.maxMana = 60;
                user.abilityPower = 4
                user.abilities.push(abilitiesFile.necromante.normalAbilities[0])
                user.weapon = {
                    name: "Foice",
                    damage: 5,
                    type: "Arma"
                }
                user.uniquePower = choiceNecromante
                user.save()
                message.menheraReply("success", t("roleplay:registred"))
                break;
        }
    }, 1000)
}