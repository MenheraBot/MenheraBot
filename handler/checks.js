const databaseRPG = require("../models/rpg.js")
const mobs = require("../models/mobs.js")
const moment = require("moment");
const dungeon = require("../commands/rpg/dungeon.js")
const { MessageEmbed } = require("discord.js");
const { accessSync } = require("fs-extra");

module.exports.getEnemy = async (user) => {

    let initialEnemy = [];
    let mediumEnemy = [];
    let hardEnemy = [];

    await mobs.find({},
        async function (err, res) {
            await res.forEach(mob => {
                switch (mob.type) {
                    case 'inicial':
                        initialEnemy.push(mob)
                        break;
                    case 'medio':
                        mediumEnemy.push(mob)
                        break;
                    case 'hard':
                        hardEnemy.push(mob)
                        break
                }
            })
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

/* module.exports.checkPassive = async (user) => {

    switch(user.class){
        case 'Assassino':
            
             break
        case 'Bárbaro':

             break
        case 'Espadachim':

             break
        default: return false;
    }

} */


module.exports.battle = async (message, escolha, user, inimigo) => {
/* 
    let açãoPassiva;
    const passiva = await this.checkPassive(user)
    if(passiva) {

    } */

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

    let danoRecebido = inimigo.damage - user.armor
    if(danoRecebido < 0) danoRecebido = 0;
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

    if (user.xp >= user.nextLevelXp) {
        user.xp = user.xp - user.nextLevelXp;
        user.nextLevelXp = user.nextLevelXp * 2;
        user.level = user.level + 1
        user.maxLife = user.maxLife + 10
        user.maxMana = user.maxMana + 10
        user.damage = user.damage + 3
        user.armor = user.armor + 2
        user.save()
        texto += `**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**`
    }
    if (texto.length > 0) message.channel.send(texto)


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
            const unicPowersAssassin = [{ name: "Morte Instantânea", description: "Mata um alvo não-épico instantâneamente, sem chance de revidar", cooldown: 86400000, damage: 999999, heal: 0, cost: 50, type: "ativo" }, { name: "Lâmina Envenenada", description: "Envenena sua lâmina causando dano e lentidão ao seu inimigo", cooldown: 86400000, damage: 50, heal: 0, cost: 50, type: "ativo" }];
            const choiceAssassin = unicPowersAssassin[Math.floor(Math.random() * unicPowersAssassin.length)];
            user.armor = 5;
            user.damage = 25;
            user.mana = 20;
            user.maxMana = 20;
            user.abilityPower = 1;
            user.abilities.push({
                name: "Furtividade",
                description: "Entra em modo furtivo, podendo fugir de situações perigosas, ou mesmo atacar pelo flanco",
                cooldown: 7200000,
                damage: 15,
                heal: 0,
                cost: 10
            })
            user.inventory.push({ name: "Adaga", damage: 5, type: "Arma" })
            user.weapon = { name: "Adaga", damage: 5, type: "Arma" }
            user.uniquePower = choiceAssassin
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Bárbaro':
            const unicPowersBarbaro = [ { name: "Golpe Desleal", description: "Intimida o inimigo, diminuindo em 25% a armadura no inimigo", cooldown: 86400000, damage: 0, heal: 0, cost: 25, type: "ativo" }, { name: "Ataque Giratório", description: "Gira sua arma causando apenas 70% do dano em TODOS os inimigos em seu alcançe", cooldown: 86400000, damage: 0, heal: 0, cost: 25, type: "ativo" }];
            const choiceBarbaro = unicPowersBarbaro[Math.floor(Math.random() * unicPowersBarbaro.length)];
            user.armor = 20;
            user.damage = 15
            user.mana = 20
            user.maxMana = 20;
            user.abilityPower = 1;
            user.abilities.push({
                name: "Fúria",
                description: "Diminui sua armadura pela metade, aumentando em 1.5x seu dano base por um turno",
                cooldown: 7200000,
                damage: 0,
                heal: 0,
                cost: 20
            })
            user.inventory.push({ name: "Machado de dois Gumes", damage: 10, type: "Arma" })
            user.weapon = { name: "Machado de dois Gumes", damage: 10, type: "Arma" }
            user.uniquePower = choiceBarbaro;
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Druida':
            const unicPowersDruida = [{ name: "Transformação | Tigre", description: "Transforma-se em um Tigre, usando seus dotes de batalha", cooldown: 0, damage: 20, heal: 0, cost: 0, type: "ativo" }, { name: "Transformação | Urso", description: "Transforma-se em um Urso, usando seus dotes de batalha", cooldown: 0, damage: 17, heal: 0, cost: 0, type: "ativo" }, { name: "Transformação | Cobra", description: "Transforma-se em uma Cobra, usando seus dotes de batalha", cooldown: 0, damage: 15, heal: 0, cost: 0, type: "ativo" }];
            const choiceDruida = unicPowersDruida[Math.floor(Math.random() * unicPowersDruida.length)];
            user.armor = 10;
            user.damage = 7;
            user.mana = 50;
            user.maxMana = 50;
            user.abilityPower = 3;
            user.abilities.push({
                name: "Maçã Dourada",
                description: "Consome uma maçã encantada, restaurando sua vida em 35%",
                cooldown: 7200000,
                damage: 0,
                heal: 30,
                cost: 20
            })
            user.inventory.push({ name: "Anel da Transformação", damage: 0, type: "Arma" })
            user.weapon = { name: "Anel da Transformação", damage: 0, type: "Arma" }
            user.uniquePower = choiceDruida;
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Espadachim':
            const unicPowersEspadachim = [ { name: "Na Mão ou no Pé?", description: "Questiona seu inimigo dando a chance dele escolher qual membro desejas perder, a mão, ou o pé? Desferindo um golpe extremamente forte", cooldown: 86400000, damage: 50, heal: 0, cost: 35, type: "ativo" }, { name: "Soryegethon", description: "Invoca o poder dos ventos, desferindo um tornado que dá dano aos inimigos", cooldown: 86400000, damage: 30, heal: 0, cost: 20, type: "ativo" }]
            const choiceEspadachim = unicPowersEspadachim[Math.floor(Math.random() * unicPowersEspadachim.length)];
            user.armor = 17;
            user.damage = 18,
            user.mana = 20;
            user.maxMana = 20;
            user.abilityPower = 1;
            user.abilities.push({
                name: "Golpe Duplo",
                description: "Executa dois golpes, com o segundo dando dano reduzido",
                cooldown: 7200000,
                damage: 20,
                heal: 0,
                cost: 20
            })
            user.inventory.push({ name: "Sabre", damage: 7, type: "Arma" })
            user.weapon = { name: "Sabre", damage: 7, type: "Arma" }
            user.uniquePower = choiceEspadachim
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Feiticeiro':
            const unicPowersFeiticeiro = [{ name: "Linhagem: Mística", description: "**LINHAGEM:** as habilidades deste feiticeiro mudam com o tipo da linhagem\n**ATIVO:** Conjura esporos que dão dano no inimigo e tem chance de incapacitá-lo por 1 turno", cooldown: 7200000, damage: 8, heal: 0, cost: 20, type: "ativo" }, { name: "Linhagem: Dracônica", description: "**LINHAGEM:** as habilidades deste feiticeiro mudam com o tipo da linhagem\n**ATIVO:** Conjura o poder do dragão, dando dano em seu alvo", cooldown: 3600000, damage: 6, heal: 0, cost: 20, type: "ativo" }, { name: "Linhagem: Demoníaca", description: "**LINHAGEM:** as habilidades deste feiticeiro mudam com o tipo da linhagem\n**ATIVO:** Rouba energia vital do inimigo", cooldown: 3600000, damage: 5, heal: 20, cost: 20, type: "ativo" }]
            const choiceFeiticeiro = unicPowersFeiticeiro[Math.floor(Math.random() * unicPowersFeiticeiro.length)];
            user.armor = 7
            user.damage = 5
            user.mana = 60
            user.maxMana = 60;
            user.abilityPower = 4
            user.abilities.push({
                name: "EXPLOOOSION",
                description: "Cria uma explosão causando dano em área",
                cooldown: 0,
                damage: 13,
                heal: 0,
                cost: 40
            })
            user.inventory.push({ name: "Cajado", damage: 5, type: "Arma" })
            user.weapon = { name: "Cajado", damage: 5, type: "Arma" }
            user.uniquePower = choiceFeiticeiro
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Clérigo':
            const unicPowersClerigo = [{ name: "Chama Divina", description: "Roga pelo fogo sagrado queimando seus inimigos", cooldown: 0, damage: 7, heal: 0, cost: 20, type: "ativo" }, { name: "Benção Elemental", description: "Abençoa o alvo aumentando seu dano base e sua armadura", damage: 0, cooldown: 7200000, heal: 0, cost: 35, type: "ativo" }, { name: "Castigo Divino", description: "Reduz a armadura do inimigo", cooldown: 7200000, damage: 0, heal: 0, cost: 20, type: "ativo" }]
            const choiceClerigo = unicPowersClerigo[Math.floor(Math.random() * unicPowersClerigo.length)];
            user.armor = 10
            user.damage = 4
            user.mana = 60
            user.maxMana = 60;
            user.abilityPower = 4
            user.abilities.push({
                name: "Cura",
                description: "Invoca a luz do caminho da verdade, curando seu alvo",
                cooldown: 7200000,
                damage: 0,
                heal: 40,
                cost: 40
            })
            user.inventory.push({ name: "Tomo Sagrado", damage: 5, type: "Arma" })
            user.weapon = { name: "Tomo Sagrado", damage: 5, type: "Arma" }
            user.uniquePower = choiceClerigo
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Monge':
            const unicPowersMonge = [{ name: "Peteleco Espiritual", description: "Da um peteleco nozovido do inimigo, causando dano BRUTAL", cooldown: 7200000, damage: 30, heal: 0, cost: 35, type: "ativo" }]
            const choiceMonge = unicPowersMonge[Math.floor(Math.random() * unicPowersMonge.length)];
            user.armor = 18
            user.damage = 14
            user.mana = 20
            user.maxMana = 20;
            user.abilityPower = 2
            user.abilities.push({
                name: "Punhos de Aço",
                description: "Fortalece seus punhos, aumentando seu dano físico",
                cooldown: 3600000,
                damage: 7,
                heal: 0,
                cost: 20
            })
            user.uniquePower = choiceMonge
            user.weapon = { name: "Punhos", damage: 1, type: "Arma" }
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Necromante':
            const unicPowerNecromante = [{ name: "Forró da meia idade", description: "Invoca um esqueleto que dá dano e evita o proximo ataque contra si", cooldown: 7200000, damage: 5, heal: 0, cost: 20, type: "ativo" }, { name: "Transformação de Corpos", description: "Possessa o inimigo, fazendo com que ele se automutile", cooldown: 7200000, damage: 35, heal: 20, cost: 20, type: "ativo" }, { name: "Festa dos Mortos", description: "Invoca monstros que ja morreram naquele local, fazendo com que lutem contra o inimigo em seu lugar", cooldown: 7200000, damage: 30, heal: 0, cost: 30, type: "ativo" }]
            const choiceNecromante = unicPowerNecromante[Math.floor(Math.random() * unicPowerNecromante.length)];
            user.armor = 7
            user.damage = 5
            user.mana = 60
            user.maxMana = 60;
            user.abilityPower = 4
            user.abilities.push({
                name: "SUCUMBA MANO",
                description: "Manda o inimigo sucumbir, danificando seu estado mental, causando dano",
                cooldown: 3600000,
                damage: 12,
                heal: 0,
                cost: 20
            })
            user.inventory.push({ name: "Foice", damage: 5, type: "Arma" })
            user.weapon = { name: "Foice", damage: 5, type: "Arma" }
            user.uniquePower = choiceNecromante
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
    }

}