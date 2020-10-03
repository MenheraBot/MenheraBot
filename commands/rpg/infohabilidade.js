const { MessageEmbed } = require("discord.js");
const database = require("../../models/rpg.js");
const abilitiesFile = require("../../Rpgs/abilities.json")

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
            arguments: ["classe", "class", "c"]
        },
        {
            opção: "habilidade",
            arguments: ["habilidade", "ability", "habilidades", "abilities", "h"]
        },
        {
            opção: "minhas",
            arguments: ["minhas", "minha", "meu", "meus", "m"]
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
            let choice = "";
            for(i = 1; i < args.length; i++){
                choice += args[i] + " "
            }
            getHab(message, choice)
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

    let filtrado;

    switch(normalized){
        case 'assassino':
            filtrado = abilitiesFile.assassin
            break;
        case 'barbaro':
            filtrado = abilitiesFile.barbarian
            break;
        case 'clerigo':
            filtrado = abilitiesFile.clerigo
            break;
        case 'druida':
            filtrado = abilitiesFile.druida
            break;
        case 'espadachim':
            filtrado = abilitiesFile.espadachim
            break;
        case 'feiticeiro': 
        filtrado = abilitiesFile.feiticeiro
            break;
        case 'monge':
            filtrado = abilitiesFile.monge
            break;
        case 'necromante':
            filtrado = abilitiesFile.necromante
            break;
    }

    const filtredOption = filtrado.uniquePowers

    let embed = new MessageEmbed()
    .setTitle(`🔮 | Habilidades do ${classe}`)
    .setColor('#9cfcde')
    
    filtredOption.forEach(hab => {
        embed.addField(hab.name, `📜 | **Descrição:** ${hab.description}\n⚔️ | **Dano:** ${hab.damage}\n💉 | **Cura:** ${hab.heal}\n💧 | **Custo:** ${hab.cost}\n🧿 | **Tipo:** ${hab.type}`)
    })

    message.channel.send(message.author, embed)

  }

  function getHab(message, habilidade){

    console.log(habilidade)

    let embed = new MessageEmbed()
    .setTitle(`🔮 | Resultados da pesquisa ${habilidade}`)
    .setColor('#9cfcde')

    var exists = false;
    let description;

    const classes = [abilitiesFile.assassin, , abilitiesFile.barbarian, abilitiesFile.druida, abilitiesFile.espadachim, abilitiesFile.feiticeiro, abilitiesFile.monge, abilitiesFile.necromante];

   classes.forEach(classe => {
          if (classe.normalAbilities.some(s => s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') == habilidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
              exists = true;
              let filtro = classe.normalAbilities.filter(s => s.name == habilidade);
              description = `📜 | **Descrição:** ${filtro[0].description}\n⚔️ | **Dano:** ${filtro[0].damage}\n💉 | **Cura:** ${filtro[0].heal}\n💧 | **Custo:** ${filtro[0].cost}`;
          } else if (classe.uniquePowers.some(s => s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') == habilidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
              exists = true;
              let filtro = classe.uniquePowers.filter(s => s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') == habilidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
              description = `**HABILIDADE ÚNICA**\n📜 | **Descrição:** ${filtro[0].description}\n⚔️ | **Dano:** ${filtro[0].damage}\n💉 | **Cura:** ${filtro[0].heal}\n💧 | **Custo:** ${filtro[0].cost}`;
          }
      })

    if(!exists){
        embed.setColor('#fd0e2f')
        embed.setDescription("**Nenhuma habilidade existente**")
        message.channel.send(embed)
    } else {
        embed.setDescription(description)
        message.channel.send(embed)
    }
  }

  async function getAll(message){

    const user = await database.findById(message.author.id)
    if(!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro")

    let filtrado;

    switch(user.class){
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
    let abilitiesFiltred = [];

    user.abilities.forEach(hab => {
        let a = filtrado.normalAbilities.filter(f => f.name == hab.name)
        abilitiesFiltred.push(a[0])
    })

    let embed = new MessageEmbed()
    .setTitle("🔮 | Suas Habilidades")
    .setColor('#a9ec67')

    embed.addField("Habilidade Única: " + uniquePowerFiltred[0].name, `📜 | **Descrição:** ${uniquePowerFiltred[0].description}\n⚔️ | **Dano:** ${uniquePowerFiltred[0].damage}\n💉 | **Cura:** ${uniquePowerFiltred[0].heal}\n💧 | **Custo:** ${uniquePowerFiltred[0].cost}`)

    abilitiesFiltred.forEach(hab => {
        embed.addField('🔮 | Habilidade: '+ hab.name,`📜 | **Descrição:** ${hab.description}\n⚔️ | **Dano:** ${hab.damage}\n💉 | **Cura:** ${hab.heal}\n💧 | **Custo:** ${hab.cost}`)
    })
    message.channel.send(message.author, embed)

  }
