const { MessageEmbed } = require("discord.js");
const database = require("../../models/rpg.js");


module.exports = {
  name: "infohabilidade",
  aliases: ["habilidades", "infohab", "abilitiesinfo", "abilities", "ih", "hi"],
  cooldown: 10,
  category: "rpg",
  description: "Veja as informações de suas habilidades, ou de uma em comum",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!infohabilidade [habilidade]",
  run: async (client, message, args) => {

    if(!args[0]) return message.channel.send(`<:atencao:759603958418767922> | Como usar o comando InfoHabilidade?\nVocê pode usar das seguintes formas:\n\nm!ih classe <classe> - retorna todas as habilidades únicas da classe citada\n\nm!ih habilidade <habilidade> - retorna as informações de uma habilidade\n\nm!ih minhas - retorna todas as suas habilidades`);

    const validArgs = [
        {
            opção: "classe",
            arguments: ["classe", "class"]
        },
        {
            opção: "habilidade",
            arguments: ["habilidade", "ability", "habilidades", "abilities"]
        },
        {
            opção: "minhas",
            arguments: ["minhas", "minha", "meu", "meus"]
        }
    ]


    const selectedOption = validArgs.some(so => so.arguments.includes(args[0].toLowerCase()))
    if (!selectedOption) return message.channel.send("<:negacao:759603958317711371> | Esta opção não é válida")
    const filtredOption = validArgs.filter(f => f.arguments.includes(args[0].toLowerCase()))

    const option = filtredOption[0].opção

    switch(option){
        case 'classe':
            if(!args[1]) return message.channel.send("<:negacao:759603958317711371> | Você não citou a classe")
            getClass(message, args[1])
            break;
        case 'habilidade':
            if(!args[1]) return message.channel.send("<:negacao:759603958317711371> | Você não citou o nome da habilidade")
            getHab(message, args[1])
            break;
        case 'minhas':
            getAll(message)
            break
    }
  }};

  function getClass(message, classe) {
     
    const classes =  ["assassino", "barbaro", "clerigo", "druida", "espadachim", "feiticeiro", "monge", "necromante"]

    const normalized = classe.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if(!classes.includes(normalized)) return message.channel.send("<:negacao:759603958317711371> | Esta classe não existe!")

    const habilidades = [
        {
           classe: "assassino",
           habilidades:  [{ name: "Morte Instantânea", description: "Mata um alvo não-épico instantâneamente, sem chance de revidar", cooldown: 86400000, damage: 999999, heal: 0, cost: 80, type: "ativo" }, { name: "Lâmina Envenenada", description: "Envenena sua lâmina causando dano e lentidão ao seu inimigo", cooldown: 86400000, damage: 50, heal: 0, cost: 25, type: "ativo" }]},
        {
            classe: "barbaro",
            habilidades:[ { name: "Golpe Desleal", description: "Intimida o inimigo, diminuindo em 25% a armadura no inimigo", cooldown: 86400000, damage: 0, heal: 0, cost: 25, type: "ativo" }, { name: "Ataque Giratório", description: "Gira sua arma causando apenas 70% do dano em TODOS os inimigos em seu alcançe", cooldown: 86400000, damage: 0, heal: 0, cost: 25, type: "ativo" }]
        },
        {
            classe: "clerigo",
            habilidades: [{ name: "Chama Divina", description: "Roga pelo fogo sagrado queimando seus inimigos", cooldown: 0, damage: 7, heal: 0, cost: 20, type: "ativo" }, { name: "Benção Elemental", description: "Abençoa o alvo aumentando seu dano base e sua armadura", damage: 0, cooldown: 7200000, heal: 0, cost: 35, type: "ativo" }, { name: "Castigo Divino", description: "Reduz a armadura do inimigo", cooldown: 7200000, damage: 0, heal: 0, cost: 20, type: "ativo" }]
        },
        {
            classe: "druida",
            habilidades: [{ name: "Transformação | Tigre", description: "Transforma-se em um Tigre, usando seus dotes de batalha", cooldown: 0, damage: 20, heal: 0, cost: 0, type: "ativo" }, { name: "Transformação | Urso", description: "Transforma-se em um Urso, usando seus dotes de batalha", cooldown: 0, damage: 17, heal: 0, cost: 0, type: "ativo" }, { name: "Transformação | Cobra", description: "Transforma-se em uma Cobra, usando seus dotes de batalha", cooldown: 0, damage: 15, heal: 0, cost: 0, type: "ativo" }]
        },
        {
            classe: "espadachim",
            habilidades: [ { name: "Na Mão ou no Pé?", description: "Questiona seu inimigo dando a chance dele escolher qual membro desejas perder, a mão, ou o pé? Desferindo um golpe extremamente forte", cooldown: 86400000, damage: 50, heal: 0, cost: 35, type: "ativo" }, { name: "Soryegethon", description: "Invoca o poder dos ventos, desferindo um tornado que dá dano aos inimigos", cooldown: 86400000, damage: 30, heal: 0, cost: 20, type: "ativo" }]
        },
        {
            classe: "feiticeiro",
            habilidades:  [{ name: "Linhagem: Mística", description: "**LINHAGEM:** as habilidades deste feiticeiro mudam com o tipo da linhagem\n**ATIVO:** Conjura esporos que dão dano no inimigo e tem chance de incapacitá-lo por 1 turno", cooldown: 7200000, damage: 8, heal: 0, cost: 20, type: "ativo" }, { name: "Linhagem: Dracônica", description: "**LINHAGEM:** as habilidades deste feiticeiro mudam com o tipo da linhagem\n**ATIVO:** Conjura o poder do dragão, dando dano em seu alvo", cooldown: 3600000, damage: 6, heal: 0, cost: 20, type: "ativo" }, { name: "Linhagem: Demoníaca", description: "**LINHAGEM:** as habilidades deste feiticeiro mudam com o tipo da linhagem\n**ATIVO:** Rouba energia vital do inimigo", cooldown: 3600000, damage: 5, heal: 20, cost: 20, type: "ativo" }]
        },
        {
            classe: "monge",
            habilidades:[ { name: "Peteleco Espiritual", description: "Da um peteleco nozovido do inimigo, causando dano BRUTAL", cooldown: 7200000, damage: 30, heal: 0, cost: 35, type: "ativo" }]
        },
        {
            classe: "necromante",
            habilidades: [{ name: "Forró da meia idade", description: "Invoca um esqueleto que dá dano e evita o proximo ataque contra si", cooldown: 7200000, damage: 5, heal: 0, cost: 20, type: "ativo" }, { name: "Transformação de Corpos", description: "Possessa o inimigo, fazendo com que ele se automutile", cooldown: 7200000, damage: 35, heal: 20, cost: 20, type: "ativo" }, { name: "Festa dos Mortos", description: "Invoca monstros que ja morreram naquele local, fazendo com que lutem contra o inimigo em seu lugar", cooldown: 7200000, damage: 30, heal: 0, cost: 30, type: "ativo" }]
        }
    ];

    const filtredOption = habilidades.filter(f => f.classe == normalized)

    
    let embed = new MessageEmbed()
    .setTitle(`🔮 | Habilidades do ${classe}`)
    .setColor('#9cfcde')

    const option = filtredOption[0]
    
    option.habilidades.forEach(hab => {
        embed.addField(hab.name, `📜 | **Descrição:** ${hab.description}\n⚔️ | **Dano:** ${hab.damage}\n💉 | **Cura:** ${hab.heal}\n💧 | **Custo:** ${hab.cost}\n🧿 | **Tipo:** ${hab.type}`)
    })

    message.channel.send(message.author, embed)

  }

  function getHab(message, habilidade){
    return message.channel.send("<:negacao:759603958317711371> | Esta categoria está em desenvolvimento")
  }

  async function getAll(message){

    const user = await database.findById(message.author.id)
    if(!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro")

    let embed = new MessageEmbed()
    .setTitle("🔮 | Suas Habilidades")
    .setColor('#a9ec67')

    embed.addField("Habilidade Única: " + user.uniquePower.name, `📜 | **Descrição:** ${user.uniquePower.description}\n⚔️ | **Dano:** ${user.uniquePower.damage}\n💉 | **Cura:** ${user.uniquePower.heal}\n💧 | **Custo:** ${user.uniquePower.cost}`)

    user.abilities.forEach(hab => {
        embed.addField('🔮 | Habilidade: '+ hab.name,`📜 | **Descrição:** ${hab.description}\n⚔️ | **Dano:** ${hab.damage}\n💉 | **Cura:** ${hab.heal}\n💧 | **Custo:** ${hab.cost}`)
    })
    message.channel.send(message.author, embed)

  }
