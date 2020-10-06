const usuario = require("../../models/user.js");

module.exports = {
    name: "give",
    aliases: ["pay"],
    cooldown: 2,
    category: "economia",
    description: "Transfira algo de seu inventário para alguém",
    userPermission: null,
    clientPermission: null,
    usage: "m!give <opção> <menção> <valor>",
    run: async (client, message, args) => {

        const validArgs = [
            {
                opção: "estrelinhas",
                arguments: ["estrelinhas", "stars", "star", "estrelas"]
            },
            {
                opção: "demônio",
                arguments: ["demonios", "demônios", "demons", "demonio", "demônio"]
            },
            {
                opção: "anjos",
                arguments: ["anjos", "anjo", "angels"]
            },
            {
                opção: "semideuses",
                arguments: ["semideuses", "semideus", "semi-deuses", "sd", "semi-deus"]
            },
            {
                opção: "deus",
                arguments: ["deus", "deuses", "gods", "god"]
            }
        ];

        if(!args[0]) return message.channel.send("<:negacao:759603958317711371> | Você deve escolher se deseja dar estrelas, demonios, anjos, semideuses ou deuses!\nUse `m!help give` para mais informações")
        const selectedOption = validArgs.some(so => so.arguments.includes(args[0].toLowerCase()))
        if (!selectedOption) return message.channel.send("<:negacao:759603958317711371> | Você deve escolher se deseja dar estrelas, demonios, anjos, demideuses ou deuses!\nUse `m!help give` para mais informações")
        const filtredOption = validArgs.filter(f => f.arguments.includes(args[0].toLowerCase()))

        const option = filtredOption[0].opção
        const mencionado = message.mentions.users.first()
        const valor = parseInt(args[2]);
        if (!mencionado) return message.channel.send("<:negacao:759603958317711371> | Você deve usar give `opção` @usuario `valor`")
        if(mencionado.id == message.author.id) return message.channel.send("<:negacao:759603958317711371> | Você não pode mencionar a si mesmo!")

        let user = await usuario.findOne({ id: message.author.id })
        let user2 = await usuario.findOne({ id: mencionado.id })

        if (!user2) return message.channel.send("<:negacao:759603958317711371> | Este usuário não está em minha database")
        if (!valor) return message.channel.send("<:negacao:759603958317711371> | Você não me disse o valor")

        if (valor < 1) return message.channel.send("<:negacao:759603958317711371> | O valor a ser dado deve ser maior que 0")

        switch (option) {
            case 'estrelinhas':
                giveStar(user, user2, valor, message, mencionado)
                break;
            case 'demônio':
                giveDemon(user, user2, valor, message, mencionado)
                break;
            case 'anjos':
                giveAngel(user, user2, valor, message, mencionado)
                break;
            case 'semideuses':
                giveSD(user, user2, valor, message, mencionado)
                break;
            case 'deus':
                giveGod(user, user2, valor, message, mencionado)
                break;
        }
    }}

    function giveStar(user, user2, valor, message, mencionado){

        if(valor > user.estrelinhas) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem este tanto de estrelinhas`)
        
        user.estrelinhas = user.estrelinhas - valor;
        user2.estrelinhas = user2.estrelinhas + valor
        user.save()
        user2.save()

        message.channel.send(`<:positivo:759603958485614652> | ${message.author} transferiu **${valor}** ⭐ para ${mencionado}`)

    }
    function giveDemon(user, user2, valor, message, mencionado){

        if(valor > user.caçados) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem este tanto de demônios`)
        
        user.caçados = user.caçados - valor;
        user2.caçados = user2.caçados + valor
        user.save()
        user2.save()

        message.channel.send(`<:positivo:759603958485614652> | ${message.author} transferiu **${valor}** <:Demon:758765044443381780> para ${mencionado}`)

    }
    function giveAngel(user, user2, valor, message, mencionado){
       
        if(valor > user.anjos) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem este tanto de anjos`)
        
        user.anjos = user.anjos - valor;
        user2.anjos = user2.anjos + valor
        user.save()
        user2.save()

        message.channel.send(`<:positivo:759603958485614652> | ${message.author} transferiu **${valor}** <:Angel:758765044204437535> para ${mencionado}`)
 
    }
    function giveSD(user, user2, valor, message, mencionado){
        
        if(valor > user.semideuses) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem este tanto de semideuses`)
        
        user.semideuses = user.semideuses - valor;
        user2.semideuses = user2.semideuses + valor
        user.save()
        user2.save()

        message.channel.send(`<:positivo:759603958485614652> | ${message.author} transferiu **${valor}** <:SemiGod:758766732235374674> para ${mencionado}`)

    }
    function giveGod(user, user2, valor, message, mencionado){
        
        if(valor > user.deuses) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem este tanto de deuses`)
        
        user.deuses = user.deuses - valor;
        user2.deuses = user2.deuses + valor
        user.save()
        user2.save()

        message.channel.send(`<:positivo:759603958485614652> | ${message.author} transferiu **${valor}** <:God:758474639570894899> para ${mencionado}`)

    }


