
const database = require("../../models/user.js")

module.exports = {
  name: "sobremim",
  aliases: ["aboutme", "am", "sm"],
  cooldown: 2,
  category: "util",
  description: "Mude seu Sobre Mim",
  userPermission: null,
  clientPermission: null,
  usage: "m!sobremim <texto>",
  run: async (client, message, args) => {


    const nota = args.join(" ");
    if(!nota) return message.channel.send("<:negacao:759603958317711371> | digite o que queres colocar em seu 'Sobre Mim'");

    database.findOne({id: message.author.id}, (err,res) =>{
        if(err) console.log(err)
        res.nota = nota;
        res.save()
    })

    message.channel.send("<:positivo:759603958485614652> | Seu 'Sobre Mim' foi alterado com sucesso! Use m!perfil >.<")


}};
