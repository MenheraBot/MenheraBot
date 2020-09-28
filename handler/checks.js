const databaseRPG = require("../models/rpg.js")

module.exports = (user, message) => {

}
module.exports.confirmRegister = async (userId, message) => {

    const user = await databaseRPG.findById(userId);

    switch (user.class) {
        case 'Assassino':
            const unicPowersAssassin = [{ name: "Morte Instantânea", description: "Mata um alvo não-épico instantâneamente, sem chance de revidar", cooldown: 86400000, damage: 999999, heal: 0, cost: 50, type: "ativo" }, { name: "Lâmina Envenenada", description: "Envenena sua lâmina causando dano e lentidão ao seu inimigo", cooldown: 86400000, damage: 50, heal: 0, cost: 50, type: "ativo" }, { name: "Última Chance", desctiption: "Caso sua vida chegue a zero, você entra em modo furtivo, fugindo da morte e da batalha", cooldown: 86400000, damage: 0, heal: 0,cost:0, type: "passivo" }];
            const choiceAssassin = unicPowersAssassin[Math.floor(Math.random() * unicPowersAssassin.length)];
            user.armor = 5;
            user.damage = 25;
            user.mana = 20;
            user.maxMana = 20;
            user.abilityPower = 1;
            user.abilities.push({
                name: "Furtividade",
                desctiption: "Entra em modo furtivo, podendo fugir de situações perigosas, ou mesmo atacar pelo flanco",
                cooldown: 7200000,
                damage: 0,
                heal: 0,
                cost: 10
            })
            user.inventory.push({ name: "Adaga", damage: 5, type: "Arma" })
            user.uniquePower = choiceAssassin
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Bárbaro':
            const unicPowersBarbaro = [{ name: "Duro de Matar", description: "Ao receber dano fatal, há 30% de chances de ignorar este dano", cooldown: 86400000, damage: 0, heal: 0, cost: 0, type: "passivo" }, { name: "Golpe Desleal", description: "Intimida o inimigo, diminuindo em 25% a armadura no inimigo", cooldown: 86400000, damage: 0, heal: 0, cost: 25, type: "ativo" }, { name: "Ataque Giratório", description: "Gira sua arma causando apenas 70% do dano em TODOS os inimigos em seu alcançe", cooldown: 86400000, damage: 0, heal: 0, cost: 25, type: "ativo" }];
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
            user.inventory.push({ name: "Anel da Transformação", damage: 0, type: "Item" })
            user.uniquePower = choiceDruida;
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Espadachim':
            const unicPowersEspadachim = [{ name: "Tempestade de Golpes", desctiption: "Seus ataques tem chance de 12% desferir um ataque adicional", cooldown: 0, damage: 17, heal: 0, cost: 0, type: "passivo" }, { name: "Na Mão ou no Pé?", description: "Questiona seu inimigo dando a chance dele escolher qual membro desejas perder, a mão, ou o pé? Desferindo um golpe extremamente forte", cooldown: 86400000, damage: 50, heal: 0, cost: 35, type: "ativo" }, { name: "Sangramento", description: "Cada golpe desferido, há 50% de chance de aplicar sangramento no inimigo", cooldown: 0, damage: 2, heal: 0, cost: 0, type: "passivo" }]
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
                damage: 0,
                heal: 0,
                cost: 20
            })
            user.inventory.push({ name: "Sabre", damage: 7, type: "Arma" })
            user.uniquePower = choiceEspadachim
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Feiticeiro':
            const unicPowersFeiticeiro = [{ name: "Linhagem: Mística", description: "**LINHAGEM:** as habilidades deste feiticeiro mudam com o tipo da linhagem\n**ATIVO:** Conjura esporos que dão dano no inimigo e tem chance de incapacitá-lo por 1 turno", cooldown: 7200000, damage: 8, heal: 0, cost: 20, type: "ativo" }, { name: "Linhagem: Dracônica", desctiption: "**LINHAGEM:** as habilidades deste feiticeiro mudam com o tipo da linhagem\n**ATIVO:** Conjura o poder do dragão, dando dano em seu alvo", cooldown: 3600000, damage: 6, heal: 0, cost: 20, type: "ativo" }, { name: "Linhagem: Demoníaca", description: "**LINHAGEM:** as habilidades deste feiticeiro mudam com o tipo da linhagem\n**ATIVO:** Rouba energia vital do inimigo", cooldown: 3600000, damage: 5, heal: 20, cost: 20, type: "ativo" }]
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
            user.inventory.push({ name: "Cajado", damage: 5, type: "Item" })
            user.uniquePower = choiceFeiticeiro
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Clérigo':
            const unicPowersClerigo = [{ name: "Chama Divina", description: "Roga pelo fogo sagrado queimando seus inimigos", cooldown: 0, damage: 7, heal: 0, cost: 20, type: "ativo" }, { name: "Benção Elemental", description: "Abençoa o alvo aumentando seu dano base e sua armadura", damage: 0, cooldown:7200000, heal: 0, cost: 35, type: "ativo" }, { name: "Castigo Divino", description: "Reduz a armadura do inimigo", cooldown:7200000, damage: 0, heal: 0, cost: 20, type: "ativo" }]
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
            user.uniquePower = choiceClerigo
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Monge':
            const unicPowersMonge = [{name: "Mente Tranquila", description: "Concentra-se no pensamento, aumentando sua armadura", cooldown: 3600000, damage: 0, heal: 0, cost: 20, type: "ativo"}, {name: "Peteleco Espiritual", description: "Da um peteleco nozovido do inimigo, causando dano BRUTAL", cooldown: 7200000, damage: 30, heal: 0, cost: 35, type: "ativo"}]
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
                damage: 5,
                heal: 0,
                cost: 20
            })
            user.uniquePower = choiceMonge
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
        case 'Necromante':
            const unicPowerNecromante = [{name: "Forró da meia idade", description: "Invoca um esqueleto que dá dano e evita o proximo ataque contra si", cooldown: 7200000, damage: 5, heal: 0, cost: 20, type: "ativo"}, {name: "Transformação de Corpos", description: "Possessa o inimigo, fazendo com que ele se automutile", cooldown: 7200000, damage: 35, heal: 20, cost: 20, type: "ativo"}, {name: "Festa dos Mortos", description: "Invoca monstros que ja morreram naquele local, fazendo com que lutem contra o inimigo em seu lugar", cooldown: 7200000, damage: 30, heal: 0, cost: 30, type: "ativo"}]
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
                cost:20
            })
            user.inventory.push({name: "Foice", damage: 5, type: "Arma"})
            user.uniquePower = choiceNecromante
            user.save()
            message.channel.send("<:positivo:759603958485614652> | Você foi registrado com sucesso! Use `m!status` para ver seus status")
            break;
    }

}