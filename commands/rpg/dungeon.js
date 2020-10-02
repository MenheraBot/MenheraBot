const { MessageEmbed } = require("discord.js");
const database = require("../../models/rpg.js");
const checks = require("../../Rpgs/checks.js")

module.exports = {
  name: "dungeon",
  aliases: ["aventura", "dungeons"],
  cooldown: 3,
  category: "rpg",
  description: "Vá para uma aventura na dungeon",
  usage: "m!dungeon",
  run: async (client, message, args) => {

    const user = await database.findById(message.author.id)
    if(!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro!")
    
    const inimigo = await checks.getEnemy(user)

    const canGo = await checks.initialChecks(user, message)

    if(!canGo) return;

    const habilidades = await checks.getAbilities(user)

    if(!inimigo) return message.channel.send("<:negacao:759603958317711371> | Essa não! Ocorreu um erro quando fui detectar qual inimigo você encontrará, desculpe por isso... Tente novamente")

    let embed = new MessageEmbed()
    .setTitle(`⌛ | Preparação pra batalha`)
    .setDescription(`Envie um **SIM** para adentrar na dungeon`)
    .setColor('#e3beff')
    .setFooter("Estas habilidades estão disponíveis para o uso")
    .addField(`Seus status atuais são`, `🩸 | **Vida:** ${user.life}/${user.maxLife}\n💧 | **Mana:** ${user.mana}/${user.maxMana}\n🗡️ | **Dano Físico:** ${user.damage}\n🛡️ | **Armadura:** ${user.armor}\n🔮 | **Poder Mágico:** ${user.abilityPower}\n\n------HABILIDADES DISPONÍVEIS------`)
    habilidades.forEach(hab =>{
        embed.addField(hab.name, `🔮 | **Dano:** ${hab.damage}\n💧 | **Custo** ${hab.cost}`)
    })
    message.channel.send(embed)

    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

    collector.on('collect', m => {
        if(m.content.toLowerCase() != "sim") return message.channel.send(`<:negacao:759603958317711371> | Você pensou melhor, e acabou desistindo de entrar na dungeon`)
    
        battle(message, inimigo, habilidades, user);
    })
  }};

async function battle(message, inimigo, habilidades, user) {

     user.dungeonCooldown = 3600000 + Date.now();
     user.save() 

    let options = [];

    options.push({name: "Ataque Básico", damage: user.damage + user.weapon.damage})

    habilidades.forEach(hab => {
        options.push(hab)
    })

    let texto = `Você entra na Dungeon, e se depara com um monstro ${inimigo.type}: ${inimigo.name}, Seus status são:\n\n❤️ | Vida: **${inimigo.life}**\n⚔️ | Dano: **${inimigo.damage}**\n🛡️ | Defesa: **${inimigo.armor}**\n\nO que você faz?\n\n**OPÇÕES:**\n`
    
    let escolhas = []

    for(i = 0; i < options.length; i++){
        texto += `\n**${i + 1}** - ${options[i].name}`
        escolhas.push(i + 1);
    }
    
    
    let embed = new MessageEmbed()
    .setFooter("Digite no chat a opção de sua escolha")
    .setTitle("Inimigo Encontrado: " + inimigo.name)
    .setColor('#f04682')
    .setDescription(texto)
    message.channel.send(message.author, embed)


    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ["time"] });

    let time = false;

    collector.on('collect', m => {
        time = true;
        const choice = Number(m.content);
        if(escolhas.includes(choice)){
            checks.battle(message, options[choice -1], user, inimigo) 
        }else{
             checks.enemyShot(message, `⚔️ |  Você tentou uma técnica nova, mas não obteve sucesso! O inimigo ataca`, user, inimigo)
        }
    })

    
    setTimeout(() => {
        if(!time) {
            checks.enemyShot(message, `⚔️ |  Você demorou para tomar uma atitude, e foi atacado!`, user, inimigo)
        }
    }, 15000)

  }


exports.continueBattle = async (message, inimigo, habilidades, user) => {

    let options = [];

    options.push({name: "Ataque Básico", damage: user.damage + user.weapon.damage})

    habilidades.forEach(hab => {
        options.push(hab)
    })

    let damageReceived = inimigo.damage - user.armor;
    if(damageReceived < 0) damageReceived = 0
    

    let texto = `**${inimigo.name}** te ataca, e causa **${damageReceived}**, atualização dos status:\n\n**SEUS STATUS**\n❤️ | Vida: **${user.life}**\n⚔️ | Dano: **${user.damage}**\n🛡️ | Defesa: **${user.armor}**\n\n**STATUS DO INIMIGO**\n❤️ | Vida: **${inimigo.life}**\n⚔️ | Dano: **${inimigo.damage}**\n🛡️ | Defesa: **${inimigo.armor}**\n\nO que você faz?\n\n**OPÇÕES:**\n`
    
    let escolhas = []

    for(i = 0; i < options.length; i++){
        texto += `\n**${i + 1}** - ${options[i].name}`
        escolhas.push(i + 1);
    }
    
    
    let embed = new MessageEmbed()
    .setFooter("Digite no chat a opção de sua escolha")
    .setColor('#f04682')
    .setDescription(texto)
    message.channel.send(message.author, embed)


    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ["time"] });

    let time = false;

    collector.on('collect', m => {
        time = true;
        const choice = Number(m.content);
        if(escolhas.includes(choice)){
            checks.battle(message, options[choice -1], user, inimigo) //Mandar os dados de ataque, e defesa do inimigo, para fazer o calculo lá
        }else{
            checks.enemyShot(message, `⚔️ |  Você tentou uma técnica nova, mas não obteve sucesso! O inimigo ataca`, user, inimigo)
        }
    })

    
    setTimeout(() => {
        if(!time) {
            checks.enemyShot(message, `⚔️ |  Você demorou para tomar uma atitude, e foi atacado!`, user, inimigo)
        }
    }, 15000)

}