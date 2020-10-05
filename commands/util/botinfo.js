const { MessageEmbed } = require("discord.js");

const config = require('../../config.json')
const moment = require('moment')
require("moment-duration-format")
moment.locale('pt-br')

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


const owner = await client.users.fetch(config.owner[0])

const embed = new MessageEmbed()
				.setColor('#fa8dd7')
				.setThumbnail("https://i.imgur.com/b5y0nd4.png")
				.setDescription(`Oi, meu nome é **${client.user.username}**, e eu sou uma Bot Brasileira para Discord com foco em diversão e RPG!\n\nEu sou feita em JavaScript com discord.js! Fui criada em **${moment.utc(client.user.createdAt).format("LLLL")}** e entrei nesse servidor **${moment.utc(message.guild.me.joinedAt).format("LLLL")}**`)
        .setFooter(`${client.user.username} foi criada por ${owner.tag}`, owner.displayAvatarURL({ format: "png", dynamic: true }))
        .addFields([
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
          },
          {
            name: "⏳ | Uptime",
            value: moment.duration(client.uptime).format("D[d], H[h], m[m], s[s]"),
            inline: true
          },
          {
            name: "<:memoryram:762817135394553876> | Memória",
            value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
            inline: true
          },
          {
            name: "🇧🇷 | Versão",
            value: require("../../package.json").version,
            inline: true
          }
        ])
        message.channel.send(embed)

}};
