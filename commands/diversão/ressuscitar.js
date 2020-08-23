const Discord = require("discord.js");

const db = require("../../models/user.js");


module.exports = {
  name: "ressuscitar",
  aliases: ["ressuscite", "respawn", "resurrect", "unkill", "reviver", "ressurgir"],
  cooldown: 2,
  category: "diversão",
  description: "Ressuscite alguém morto com m!matar",
  usage: "m!ressuscitar <@menção>",
  run: async (client, message, args) => {

  var list = [
   "https://i.imgur.com/krVf6J7.gif",
   "https://i.imgur.com/igSM6nd.gif",
   "https://i.imgur.com/h1a2nd8.gif"
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let user = message.mentions.users.first();
  let avatar = message.author.displayAvatarURL({ format: "png" });

  if (!user) {
    return message.reply("Como ressuscitar o nada, que nunca morreu");
  }

  if (user === message.author) {
    return message.reply("uai, se tu ta morto, como tu ta digitando?");
  }

  if(user.bot) return message.channel.send(`um robô foi religado UwU >.<`)

  const embed = new Discord.MessageEmbed()
    .setTitle("Ressuscitar")
    .setColor("#000000")
    .setDescription(`${message.author} Ressuscitou ${user}`)
    .setImage(rand)
    .setThumbnail(avatar)
    .setAuthor(message.author.tag, avatar);

   message.channel.send(embed);

   db.findOne({id: user.id}, (err, res) => {
    if(err) console.log(err);
    if(!res){
      const newUser = new db({
        id: user.id,
        nome: user.username,
        mamadas: 0,
        mamou: 0,
        status: 1
      })
      newUser.save().catch(err => console.log(err));
    } else {
      res.status = 1;
      res.save().catch(err => console.log(err))
    }
  })
}};
