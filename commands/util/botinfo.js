const {MessageEmbed} = require("discord.js");

const userModel = require("../../models/user.js");

module.exports = {
  name: "botinfo",
  aliases: ["infobot", "informações", "menherainfo", "infomenhera", "menhera","bi","ib"],
  cooldown: 10,
  category: "util",
  description: "Mostra as informações atuais do bot",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!botinfo",
  run: async (client, message, args) => {

  let avatar = message.author.displayAvatarURL({ format: "png" });
  let days = Math.floor(client.uptime / 86400000);
  let hours = Math.floor(client.uptime / 3600000) % 24;
  let minutes = Math.floor(client.uptime / 60000) % 60;
  let seconds = Math.floor(client.uptime / 1000) % 60;
  let uptime = `${days}d, ${hours}h, ${minutes}m e ${seconds}s`;
  if(days == 0 && hours != 0) uptime = `${hours}h, ${minutes}m e ${seconds}s`;
  if(hours == 0) uptime = `${minutes}m e ${seconds}s`;

let embed = new MessageEmbed()
.setTitle(`📈 | Menhera Status`, client.user.displayAvatarURL())
.setFooter(message.author.tag, avatar)
.setTimestamp()
.setColor('#eab3fa')


userModel.countDocuments({}, function(err, count) {
  if (err) console.log(err)
  
  embed.addFields([
    {
      name: "🌐 | Servers",
      value: `${client.guilds.cache.size} `,
      inline: true 
    },
    {
      name: "🗄️ | Canais",
            value: client.channels.cache.size,
            inline: true
    },
    {
      name: "📊 | Usuários",
      value: client.users.cache.size,
      inline: true
    }
  ],
  [  
    {
      name: "⏳ | Uptime",
      value: uptime,
      inline: true
    },
    {
      name: "🧮 | Usuários na DB",
      value: count,
      inline: true
    }
  ]
  )
  message.channel.send(message.author, embed);
})
}};
