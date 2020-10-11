const database = require("../../models/rpg.js");
const familyDb = require("../../models/familia")

module.exports = {
    name: "reset",
    aliases: [],
    cooldown: 3,
    category: "rpg",
    dir: 'RpgResetCommand',
    description: "Reseta seu perfil do RPG",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
    usage: "m!reset",
    run: async (client, message, args) => {

        const user = await database.findById(message.author.id)
        if (!user) return message.channel.send("<:negacao:759603958317711371> | Você não é um aventureiro!")
        if(user.level < 7) return message.channel.send("<:negacao:759603958317711371> | Você precisa estar no nível **7** para poder resetar")

        message.channel.send("<:atencao:759603958418767922> | Você realmente deseja resetar seu perfil do RPG? Esta ação é **IRREVERSÍVEL**\nDigite `sim` para confirmar")

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector(filter, {
            max: 1,
            time: 30000,
            errors: ["time"]
        });

        collector.on('collect', async m => {
            
            if(m.content.toLowerCase() == "sim"){
                if(user.hasFamily){
                    const familia = await familyDb.findById(user.familyName)
                    familia.members.splice(familia.members.indexOf(message.author.id.toString()), 1);
                    familia.save()
                }
                database.findByIdAndDelete(message.author.id).then(message.channel.send("<:positivo:759603958485614652> | Você resetou com sucesso sua conta do RPG! Para jogar novamente, use m!registrar"))
            } else message.channel.send("<:negacao:759603958317711371> | Sua conta **não** foi resetada!")
        
        })
    }
}