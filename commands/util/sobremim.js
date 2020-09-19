
const database = require("../../models/user.js")

module.exports = {
  name: "sobremim",
  aliases: ["aboutme", "am", "sm"],
  cooldown: 2,
  category: "util",
  description: "Mude seu Sobre Mim",
  usage: "m!sobremim <texto>",
  run: async (client, message, args) => {


    const nota = args.join(" ");
    if(!nota) return message.reply("digite o que queres colocar em seu 'Sobre Mim'");

    database.findOne({id: message.author.id}, (err,res) =>{
        if(err) console.log(err)
        res.nota = nota;
        res.save()
    })

    message.reply("Seu 'Sobre Mim' foi alterado com sucesso! Use m!perfil >.<")


}};
