const { MessageEmbed, Collection } = require("discord.js");
const config = require("../config.json");
const database = require("../models/user");
const cmdDb = require("../models/cmds.js")
const serverDb = require("../models/guild.js")
const moment = require("moment");

moment.locale("pt-br");

const cooldowns = new Collection();

module.exports = async (client, message) => {

  //ping system
  if (message.author.id === "757295289630720031" && message.content === "PINGING...") {
    setTimeout(() => message.channel.send("Pong! That's my response to your call, master"), 200)
    return
  }
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  const server = await serverDb.findOne({ id: message.guild.id })
  if (!server) {
    serverDb({
      id: message.guild.id
    }).save()
  }

  let prefix;
  if (!server) {
    prefix = config.prefix;
  } else prefix = server.prefix.toLowerCase();

  if (message.mentions.users.size >= 0) {
    message.mentions.users.forEach(async (member) => {
      if (!member) return
      const usuario = await database.findOne({ id: member.id })
      if (usuario) {
        if (usuario.afk === true) {
          message.channel.send(`<:notify:759607330597502976> | ${message.author}, \`${member.tag}\` está AFK: ${usuario.afkReason}`)
        }
      }
    })
  }
  let user = await database.findOne({ id: message.author.id })
  if (user) {
    if (user.afk == true) {
      user.afk = false
      user.afkReason = null
      user.save()
      message.channel.send(`Bem vindo de volta ${message.author} >.<`).then(msg => msg.delete({ timeout: 5000 })).catch()
    }
  }

  if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) return message.channel.send(`Oizinho ${message.author}, meu prefixo neste servidor é '${prefix}'`);

  if (!message.content.toLowerCase().startsWith(prefix)) return;

  if (!message.member) message.member = await message.guild.fetch(message);

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;

  let command = client.commands.get(cmd);
  if (!command) command = client.commands.get(client.aliases.get(cmd));
  if (!command) return;

  if (command) {

    if (!user) {
      await new database({
        id: message.author.id,
        nome: message.author.username,
        shipValue: Math.floor(Math.random() * 55)
      }).save()
    }

    if (user) {
      if (user.ban) {

        let avatar
        if (!message.author.avatar.startsWith("a_")) {
          if (!message.author.avatar) {
            avatar = message.author.displayAvatarURL()
          } else {
            avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=2048`
          }
        } else {
          if (!message.author.avatar) {
            avatar = message.author.displayAvatarURL()
          } else {
            avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.gif?size=2048`
          }
        }
        let owner = await client.users.fetch("435228312214962204")

        const embed = new MessageEmbed()
          .setColor('#c1001d')
          .setAuthor("Você foi banido", avatar)
          .setDescription(`Olá ${message.author}, você foi banido de usar a Menhera`)
          .addField("Motivo", user.banReason)
          .addField("Banido injustamente?", `Se você acha que foi banido injustamente, então entre em contato com a ${owner.tag} ou entre no meu servidor de suporte.`)

        message.channel.send(embed).catch(() => {
          message.author.send(embed)
        })
        return
      }
    }

    if (command.devsOnly) {
      if (!config.owner.includes(message.author.id)) return message.channel.send(`Perdão ${message.author}, este comando só está disponível para minha dona :(`)
    }

    let c = await cmdDb.findById(command.name)
    if (c.maintenance) {
      if (!config.owner.includes(message.author.id)) {
        return message.channel.send(`<:negacao:759603958317711371> | **MANUTENÇÃO**\n Este comando está em manutenção por tempo indeterminado!\n\n**Motivo:** ${c.maintenanceReason}`)
      }
    }


    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    if (!config.owner.includes(message.author.id)) {

      const now = Date.now();
      const timestamps = cooldowns.get(command.name);
      const cooldownAmount = (command.cooldown || 3) * 1000;

      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return message.channel.send(`<:atencao:759603958418767922> | Espere ${timeLeft.toFixed(1)} segundos antes de usar o comando \`${command.name}\` em específico`);
        }
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    }

     let userPermission = command.userPermission
		let clientPermission = command.clientPermission
		if (userPermission !== null) {
			if (!message.member.hasPermission(userPermission)) {
				let perm = userPermission.map(value => value).join(", ")
				return message.channel.send("<:atencao:759603958418767922> | Você não tem permissão o suficiente para executar esse comando!\nPermissões necessárias: " + perm )
			}
		}
		if (clientPermission !== null) {
			if (!message.guild.me.hasPermission(clientPermission) || !message.channel.permissionsFor(client.user.id).has(clientPermission)) {
				let perm = clientPermission.map(value => `\`${value}\``).join(", ")
				return message.channel.send(`<:atencao:759603958418767922> | Eu não tenho permissão para executar esse comando! Permissões necessárias: ${perm}`)
			}
		}
 
    try {

			new Promise((res, rej) => {

				message.channel.startTyping()
        res(command.run(client, message, args))
        console.log(`[COMANDO] Comando ${command.name} executado por ${message.author.id} (${moment(Date.now()).format("l LTS")})`)
			}).then(() => message.channel.stopTyping()).catch(err => {

        message.channel.stopTyping()

        let canal = client.channels.cache.get('730906866896470097')

				message.channel.stopTyping()
				const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack
				const embed = new MessageEmbed()
				embed.setColor('#fd0000')
				embed.setTitle(`<:menhera_cry:744041825140211732> | Ocorreu um erro ao executar o comando ${command.name}`)
        embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``)
        embed.addField(`<:atencao:759603958418767922> | Usage`, `UserId: \`${message.author.id}\` \nServerId: \`${message.guild.id}\``)
        embed.setTimestamp()
				embed.addField(`<:ok:727975974125436959> | Reporte esse problema`, "Entre em meu servidor de suporte para reportar esse problema à minha dona")

        message.channel.send(embed).catch(() => message.channel.send("Aparentemente ocorreu um erro ao executar este comando! Reporte isso à minha dona em meu servidor de suporte!"))
        canal.send(embed)
			})
		} catch (err) {

      let canal = client.channels.cache.get('730906866896470097')

      message.channel.stopTyping()
      
				const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack
				const embed = new MessageEmbed()
				embed.setColor('#fd0000')
				embed.setTitle(`<:menhera_cry:744041825140211732> | Ocorreu um erro ao executar o comando ${command.name}`)
        embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``)
        embed.addField(`<:atencao:759603958418767922> | Usage`, `UserId: \`${message.author.id}\` \nServerId: \`${message.guild.id}\``)
        embed.setTimestamp()
				embed.addField(`<:ok:727975974125436959> | Reporte esse problema`, "Entre em meu servidor de suporte para reportar esse problema à minha dona")

        message.channel.send(embed).catch(() => message.channel.send("Aparentemente ocorreu um erro ao executar este comando! Reporte isso à minha dona em meu servidor de suporte!"))
        canal.send(embed)
			  console.error(err.stack)
		}
	
  }
}