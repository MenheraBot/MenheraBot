const databaseRPG = require("../models/rpg.js")
const moment = require("moment");
const dungeon = require("../commands/rpg/dungeon.js")
const { MessageEmbed } = require("discord.js");
const abilitiesFile = require("../Rpgs/abilities.json");
const mobsFile = require("../Rpgs/mobs.json");

module.exports.getEnemy = async (user) => {

    let initialEnemy = [];
    let mediumEnemy = [];
    let hardEnemy = [];

    mobsFile.inicial.forEach(initialMob => {
        initialEnemy.push(initialMob)
    })

    mobsFile.medio.forEach(mediumMob => {
        mediumEnemy.push(mediumMob)
    })

    mobsFile.hard.forEach(hardMob => {
        hardEnemy.push(hardMob)
    })

    let monstro;

    if (user.level < 5) {
        monstro = await initialEnemy[Math.floor(Math.random() * initialEnemy.length)];
    } else if (user.level > 4 && user.level < 10) {
        monstro = await mediumEnemy[Math.floor(Math.random() * mediumEnemy.length)];
    } else if (user.level > 9) {
        monstro = await hardEnemy[Math.floor(Math.random() * hardEnemy.length)];
    }
    return monstro;
}

module.exports.battle = async (message, escolha, user, inimigo) => {

    let danoUser;
    if (escolha.name == "Ataque Básico") {
        danoUser = escolha.damage
    } else {
        if (user.mana < escolha.cost) return this.enemyShot(message, `⚔️ | Você tenta usar **${escolha.name}**, mas não tem mana o suficiente para isso! O inimigo revida!`, user, inimigo)
        if(escolha.heal > 0){
            user.life = user.life + escolha.heal
            if(user.life > user.maxLife) user.life = user.maxLife
        } 
        danoUser = escolha.damage * user.abilityPower;
        user.mana = user.mana - escolha.cost
    }

    setTimeout(() => {
        let enemyArmor = inimigo.armor
        if(escolha.name == "Castigo Divino"){
            enemyArmor = inimigo.armor - 20
            if(enemyArmor < 0) enemyArmor = 0 
        }
        let danoDado = danoUser - enemyArmor;
        if(danoDado < 0) danoDado = 0;
        let vidaInimigo = inimigo.life - danoDado;

        message.channel.send(`⚔️ | Você ataca **${inimigo.name}** com **${escolha.name}**, e causa **${danoDado}** de dano`)

        if (vidaInimigo < 1) return user.save().then(() => this.resultBattle(message, user, inimigo))

        const enemy = {
            name: inimigo.name,
            damage: inimigo.damage,
            life: vidaInimigo,
            armor: inimigo.armor,
            loots: inimigo.loots,
            xp: inimigo.xp
        }

        user.save().then(() => this.enemyShot(message, "", user, enemy))
    }, 150)
}

module.exports.morte = async (message, user) => {
    message.channel.send("<:negacao:759603958317711371> | Essa não!! Você morreu! Para se recuperar dos danos, você retornou para a guilda, e ficará de repouso por 24 horas!")
    user.death = Date.now() + 86400000;
    user.life = 0
    user.save()
}

module.exports.enemyShot = async (message, text, user, inimigo) => {

    const habilidades = await this.getAbilities(user)

    if (text.length > 0) message.channel.send(text)

    let danoRecebido 
    if((inimigo.damage - user.armor ) < 0){
        danoRecebido = 0;
    } else {
        danoRecebido = inimigo.damage - user.armor
    }
    let vidaUser = user.life - danoRecebido;

    if (vidaUser < 1) {
        return this.morte(message, user)
    } else {
        user.life = vidaUser
        user.save().then(() => dungeon.continueBattle(message, inimigo, habilidades, user))
    }
}

module.exports.finalChecks = async (message, user) => {

    let texto = "";

    if(user.level < 5){
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
            if(user.level === 5) this.newAbilities(message,user)
        })
    }
} else if(user.level > 4 && user.level < 10){
    if (user.xp >= user.nextLevelXp) {
    user.nextLevelXp = user.nextLevelXp * 2;
    user.level = user.level + 1
    user.maxLife = user.maxLife + 20
    user.maxMana = user.maxMana + 15
    user.damage = user.damage + 5
    user.armor = user.armor + 3
    texto += `**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**`
    message.channel.send(texto)
    user.save().then(() => this.newAbilities(message, user))
    }
} else if(user.level > 9){
    if (user.xp >= user.nextLevelXp) {
    user.nextLevelXp = user.nextLevelXp * 2;
    user.level = user.level + 1
    user.maxLife = user.maxLife + 50
    user.maxMana = user.maxMana + 20
    user.damage = user.damage + 7
    user.armor = user.armor + 5
    texto += `**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**`
    message.channel.send(texto)
    user.save().then(() => this.newAbilities(message, user))
    }
}}

module.exports.newAbilities = async (message, user) => {

    if(user.level == 5){
        switch(user.class){
            case 'Assassino':
                user.abilities.push(abilitiesFile.assassin.normalAbilities[1])
                user.maxMana = user.maxMana + 20
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.assassin.normalAbilities[1].name}**`)
                break;
            case 'Bárbaro':
                user.abilities.push(abilitiesFile.barbarian.normalAbilities[1])
                user.maxLife = user.maxLife + 20
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.barbarian.normalAbilities[1].name}**`)
                break;
            case 'Clérigo':
                user.abilities.push(abilitiesFile.clerigo.normalAbilities[1]) 
                user.abilityPower = user.abilityPower + 1
                user.maxMana = user.maxMana + 20
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.clerigo.normalAbilities[1].name}**`)
                break;
            case 'Druida':
                user.abilities.push(abilitiesFile.druida.normalAbilities[1])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.druida.normalAbilities[1].name}**`)
                break;
            case 'Espadachim':
                user.abilities.push(abilitiesFile.espadachim.normalAbilities[1])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.espadachim.normalAbilities[1].name}**`)
                break;
            case 'Feiticeiro':
                if(user.uniquePower.name == "Linhagem: Mística"){
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[1])
                    user.maxMana = user.maxMana + 20
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.feiticeiro.normalAbilities[1].name}**`)
                } 
                if(user.uniquePower.name == "Linhagem: Dracônica"){
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[2])
                    user.maxMana = user.maxMana + 20
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.feiticeiro.normalAbilities[1].name}**`)
                } 
                if(user.uniquePower.name == "Linhagem: Demoníaca"){
                     user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[3])
                     user.maxMana = user.maxMana + 20
                     user.abilityPower = user.abilityPower + 1
                     user.save()
                     message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.feiticeiro.normalAbilities[1].name}**`)
                }
                break;
            case 'Monge':
                user.abilities.push(abilitiesFile.monge.normalAbilities[1])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.monge.normalAbilities[1].name}**`)
                break;
            case 'Necromante':
                user.abilities.push(abilitiesFile.necromante.normalAbilities[1])
                user.maxMana = user.maxMana + 20
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.necromante.normalAbilities[1].name}**`)
                break;
        }

    } else if(user.level == 10){
        switch(user.class){
            case 'Assassino':
                user.abilities.push(abilitiesFile.assassin.normalAbilities[2])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.assassin.normalAbilities[2].name}**`)
                break;
            case 'Bárbaro':
                user.abilities.push(abilitiesFile.barbarian.normalAbilities[2])
                user.maxLife = user.maxLife + 50
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.barbarian.normalAbilities[2].name}**`)
                break;
            case 'Clérigo':
                user.abilities.push(abilitiesFile.clerigo.normalAbilities[2]) 
                user.abilityPower = user.abilityPower + 1
                user.maxMana = user.maxMana + 20
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.clerigo.normalAbilities[2].name}**`)
                break;
            case 'Druida':
                user.abilities.push(abilitiesFile.druida.normalAbilities[2])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.druida.normalAbilities[2].name}**`)
                break;
            case 'Espadachim':
                user.abilities.push(abilitiesFile.espadachim.normalAbilities[2])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.espadachim.normalAbilities[2].name}**`)
                break;
            case 'Feiticeiro':
                if(user.uniquePower.name == "Linhagem: Mística"){
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[4])
                    user.maxMana = user.maxMana + 25
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.feiticeiro.normalAbilities[4].name}**`)
                } 
                if(user.uniquePower.name == "Linhagem: Dracônica"){
                    user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[5])
                    user.maxMana = user.maxMana + 25
                    user.abilityPower = user.abilityPower + 1
                    user.save()
                    message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.feiticeiro.normalAbilities[5].name}**`)
                } 
                if(user.uniquePower.name == "Linhagem: Demoníaca"){
                     user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[6])
                     user.maxMana = user.maxMana + 25
                     user.abilityPower = user.abilityPower + 1
                     user.save()
                     message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.feiticeiro.normalAbilities[6].name}**`)
                }
                break;
            case 'Monge':
                user.abilities.push(abilitiesFile.monge.normalAbilities[2])
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.monge.normalAbilities[2].name}**`)
                break;
            case 'Necromante':
                user.abilities.push(abilitiesFile.necromante.normalAbilities[2])
                user.maxMana = user.maxMana + 25
                user.abilityPower = user.abilityPower + 1
                user.save()
                message.channel.send(`<a:LevelUp:760954035779272755> | Você atingiu o nível **${user.level}** e liberou uma nova habilidade! **${abilitiesFile.necromante.normalAbilities[2].name}**`)
                break;
        }
    }
} 

module.exports.resultBattle = async (message, user, inimigo) => {

    const randomLoot = inimigo.loots[Math.floor(Math.random() * inimigo.loots.length)];

    const embed = new MessageEmbed()
        .setTitle("⚔️ | Resultados da Batalha")
        .setDescription(`**Esse dano é o suficiente para matar ${inimigo.name}!**\n\n**Loots:**`)
        .setColor("#4cf74b")
        .addFields([{
            name: "🔰 | XP",
            value: inimigo.xp,
            inline: true
        },
        {
            name: "<:Chest:760957557538947133> | Espólios de Batalha",
            value: randomLoot.name,
            inline:true
        }
        ])

    message.channel.send(message.author, embed)
    user.xp = user.xp + inimigo.xp;
    user.loots.push(randomLoot)
    user.save().then(() => this.finalChecks(message, user))

}

module.exports.getAbilities = async (user) => {


    let abilities = [];

    if (user.uniquePower.type === "ativo") abilities.push(user.uniquePower)

    user.abilities.forEach(hab => {
        abilities.push(hab)
    })

    return abilities;
}


module.exports.initialChecks = async (user, message) => {

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
        motivo.push({ name: "💔 | Sem Vida", value: `Você está sem vida, e precisa descansar por mais **${(parseInt(user.death - Date.now()) > 3600000) ? moment.utc(parseInt(user.death - Date.now())).format("HH:mm:ss") : moment.utc(parseInt(user.death - Date.now())).format("mm:ss")}** horas` })
    }
    if (user.dungeonCooldown > Date.now()) {
        pass = false
        motivo.push({ name: "💤 | Cansaço", value: `Você já visitou a dungeon e precisa descansar por mais **${moment.utc(parseInt(user.dungeonCooldown - Date.now())).format("mm:ss")}** minutos` })
    }

    if(parseInt(user.hotelTime) > Date.now()){
       pass = false
       motivo.push({ name: "🏨 | Hotel", value: `Você está descansando no hotel da vila, e não pode ir para a dungeon até que sua estadia acabe, em **${(parseInt(user.hotelTime - Date.now()) > 3600000) ? moment.utc(parseInt(user.hotelTime - Date.now())).format("HH:mm:ss") : moment.utc(parseInt(user.hotelTime - Date.now())).format("mm:ss")}** horas`})
    }

    if (!pass) {
        let texto = `<:negacao:759603958317711371> | Você não pode visitar a dungeon pelos seguintes motivos:`;
        motivo.forEach(m => {
            texto += `\n**${m.name}:** ${m.value}`
        })
        message.channel.send(texto)
    }
    return user.save().then(() => pass)

}

module.exports.confirmRegister = async (userId, message) => {

    const user = await databaseRPG.findById(userId);
  
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
            user.inventory.push({ name: "Adaga", damage: 5, type: "Arma" })
            user.weapon = { name: "Adaga", damage: 5, type: "Arma" }
            user.uniquePower = choiceAssassin
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
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
            user.inventory.push({ name: "Machado de dois Gumes", damage: 10, type: "Arma" })
            user.weapon = { name: "Machado de dois Gumes", damage: 10, type: "Arma" }
            user.uniquePower = choiceBarbaro;
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
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
            user.inventory.push({ name: "Anel da Transformação", damage: 0, type: "Arma" })
            user.weapon = { name: "Anel da Transformação", damage: 0, type: "Arma" }
            user.uniquePower = choiceDruida;
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
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
            user.inventory.push({ name: "Sabre", damage: 7, type: "Arma" })
            user.weapon = { name: "Sabre", damage: 7, type: "Arma" }
            user.uniquePower = choiceEspadachim
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
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
            user.inventory.push({ name: "Cajado", damage: 5, type: "Arma" })
            user.weapon = { name: "Cajado", damage: 5, type: "Arma" }
            user.uniquePower = choiceFeiticeiro
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
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
            user.inventory.push({ name: "Tomo Sagrado", damage: 5, type: "Arma" })
            user.weapon = { name: "Tomo Sagrado", damage: 5, type: "Arma" }
            user.uniquePower = choiceClerigo
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
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
            user.weapon = { name: "Punhos", damage: 1, type: "Arma" }
            user.inventory.push({ name: "Punhos", damage: 1, type: "Arma" })
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
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
            user.inventory.push({ name: "Foice", damage: 5, type: "Arma" })
            user.weapon = { name: "Foice", damage: 5, type: "Arma" }
            user.uniquePower = choiceNecromante
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
    }

}