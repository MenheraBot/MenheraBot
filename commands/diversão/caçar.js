const Discord = require("discord.js");

const database = require("../../models/user.js");

const moment = require("moment")

module.exports = {
  name: "caçar",
  aliases: ["cacar", "caça", "caca","hunt"],
  cooldown: 3,
  category: "diversão",
  description: "Caçe demônios como XANDÂO",
  usage: "m!caçar",
  run: async (client, message, args) => {

    let user = await database.findOne({id: message.author.id});

    if (!user || user === null) {
         new database({
            id: message.author.id,
            nome: message.author.username
          }).save()
    }

    if (parseInt(user.caçarTime) < Date.now()) {
    
    const probabilidades = [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,4];
    let demonios = probabilidades[Math.floor(Math.random() * probabilidades.length)];

    user.caçados = user.caçados + demonios;
    user.caçarTime = 3600000 + Date.now();
    user.save();
    
    let avatar = message.author.displayAvatarURL({format: "png", dynamic: true});
    const embed = new Discord.MessageEmbed()
    .setTitle("Caçada aos demônios")
    .setColor("#faa40f")
    .setThumbnail(avatar)
    .setDescription((demonios > 1) ? `Você saiu para caçar demônios com o Super Xandão, e caçou \`${demonios}\` demônios` : `Você saiu para caçar demônios com o Super Xandão, e caçou \`${demonios}\` demônio`)
    
    message.reply(embed)

		} else {
				 message.channel.send(`Descanse campeão ${message.author}, você já saiu na sua caçada à demônios. Tente novamente em ${moment.utc(parseInt(user.caçarTime - Date.now())).format("mm:ss")}`)
		}

}};
