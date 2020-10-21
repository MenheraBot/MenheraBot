const { MessageEmbed, Collection } = require("discord.js");
const moment = require("moment");
moment.locale("pt-br");
const cooldowns = new Collection();

module.exports = class MessageReceive {
  constructor(client) {
    this.client = client
  }

  async run(message) {

    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

    let server = await this.client.database.Guilds.findOne({ id: message.guild.id })
    if (!server) {
      this.client.database.Guilds({ id: message.guild.id }).save()
    }

    let prefix;
    if (!server) {
      prefix = this.client.config.prefix;
    } else prefix = server.prefix.toLowerCase();

    if (message.mentions.users.size >= 0) {
      message.mentions.users.forEach(async (member) => {
        if (!member) return
        const usuario = await this.client.database.Users.findOne({ id: member.id })
        if (usuario) {
          if (usuario.afk === true) {
            message.channel.send(`<:notify:759607330597502976> | ${message.author}, \`${member.tag}\` está AFK: ${usuario.afkReason}`).catch()
          }
        }
      })
    }
    let user = await this.client.database.Users.findOne({ id: message.author.id })
    if (user) {
      if (user.afk == true) {
        user.afk = false
        user.afkReason = null
        user.save()
        message.channel.send(`Bem vindo de volta ${message.author} >.<`).then(msg => msg.delete({
          timeout: 5000
        })).catch()
      }
    }

    if (message.content.startsWith(`<@!${this.client.user.id}>`) || message.content.startsWith(`<@${this.client.user.id}>`)) return message.channel.send(`<:guilda:759892389724028948> **|** Oizinho ${message.author}, meu nome é Menhera, meu prefixo neste servidor é \`${prefix}\`. Use \`${prefix}help\` para ver todos os meus comandos!`).catch()

    if (!message.content.toLowerCase().startsWith(prefix)) return;

    if (!message.member) message.member = await message.guild.fetch(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = this.client.commands.get(cmd);
    if (!command) command = this.client.commands.get(this.client.aliases.get(cmd));
    if (!command) return;

    if (!user) {
      await new this.client.database.Users({
        id: message.author.id,
        nome: message.author.username,
        shipValue: Math.floor(Math.random() * 55)
      }).save()
    }

    if (!message.guild.me.hasPermission("SEND_MESSAGES")) return;

    if (server && server.blockedChannels.includes(message.channel.id) && !message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send(`<:negacao:759603958317711371> | Meus comandos estão bloqueados neste canal, ${message.author}`)

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
        let owner = await this.client.users.fetch("435228312214962204")

        const embed = new MessageEmbed()
          .setColor('#c1001d')
          .setAuthor("Você foi banido", avatar)
          .setDescription(`Olá ${message.author}, você foi banido de usar a Menhera`)
          .addField("Motivo", user.banReason)
          .addField("Banido injustamente?", `Se você acha que foi banido injustamente, então entre em contato com a ${owner.tag} ou entre no meu servidor de suporte.`)

        message.channel.send(embed).catch(() => { message.author.send(embed).catch() })
        return
      }
    }

    if (command.config.devsOnly) {
      if (!this.client.config.owner.includes(message.author.id)) return message.channel.send(`Perdão ${message.author}, este comando só está disponível para minha dona :(`)
    }

    let c = await this.client.database.Cmds.findById(command.config.name)
    if (c.maintenance) {
      if (!this.client.config.owner.includes(message.author.id)) {
        return message.channel.send(`<:negacao:759603958317711371> | **MANUTENÇÃO**\n Este comando está em manutenção por tempo indeterminado!\n\n**Motivo:** ${c.maintenanceReason}`)
      }
    }

    if (!cooldowns.has(command.config.name)) {
      cooldowns.set(command.config.name, new Collection());
    }

    if (!this.client.config.owner.includes(message.author.id)) {

      const now = Date.now();
      const timestamps = cooldowns.get(command.config.name);
      const cooldownAmount = (command.config.cooldown || 3) * 1000;

      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return message.channel.send(`<:atencao:759603958418767922> | Espere ${timeLeft.toFixed(1)} segundos antes de usar o comando \`${command.config.name}\` em específico`);
        }
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    }

    let userPermission = command.config.userPermissions
    let clientPermission = command.config.clientPermissions
    if (userPermission !== null) {
      if (!message.member.hasPermission(userPermission)) {
        let traslated = this.perm(clientPermission).map(a => a).join(", ")
        return message.channel.send(`<:atencao:759603958418767922> | Você não tem permissão de \`${traslated}\` para executar esse comando!`)
      }
    }
    if (clientPermission !== null) {
      if (!message.guild.me.hasPermission(clientPermission) || !message.channel.permissionsFor(this.client.user.id).has(clientPermission)) {
        let traslated = this.perm(clientPermission).map(a => a).join(", ")
        return message.channel.send(`<:atencao:759603958418767922> | Eu preciso de permissão de \`${traslated}\` para executar esse comando!`)
      }
    }

    try {

      new Promise((res, rej) => {

        message.channel.startTyping()
        res(command.run(message, args))
        console.log(`[COMANDO] Comando ${command.config.name} executado por ${message.author.id} (${moment(Date.now()).format("l LTS")})`)
      }).then(() => message.channel.stopTyping()).catch(err => {

        message.channel.stopTyping()

        let canal = this.client.channels.cache.get('730906866896470097')

        message.channel.stopTyping()
        const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack
        const embed = new MessageEmbed()
        embed.setColor('#fd0000')
        embed.setTitle(`<:menhera_cry:744041825140211732> | Ocorreu um erro ao executar o comando ${command.config.name}`)
        embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``)
        embed.addField(`<:atencao:759603958418767922> | Usage`, `UserId: \`${message.author.id}\` \nServerId: \`${message.guild.id}\``)
        embed.setTimestamp()
        embed.addField(`<:ok:727975974125436959> | Reporte esse problema`, "Entre em meu servidor de suporte para reportar esse problema à minha dona")

        message.channel.send(embed).catch(() => message.channel.send("Aparentemente ocorreu um erro ao executar este comando! Reporte isso à minha dona em meu servidor de suporte!"))
        canal.send(embed).catch()
      })
    } catch (err) {

      let canal = this.client.channels.cache.get('730906866896470097')

      message.channel.stopTyping()

      const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack
      const embed = new MessageEmbed()
      embed.setColor('#fd0000')
      embed.setTitle(`<:menhera_cry:744041825140211732> | Ocorreu um erro ao executar o comando ${command.config.name}`)
      embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``)
      embed.addField(`<:atencao:759603958418767922> | Usage`, `UserId: \`${message.author.id}\` \nServerId: \`${message.guild.id}\``)
      embed.setTimestamp()
      embed.addField(`<:ok:727975974125436959> | Reporte esse problema`, "Entre em meu servidor de suporte para reportar esse problema à minha dona")

      message.channel.send(embed).catch(() => message.channel.send("Aparentemente ocorreu um erro ao executar este comando! Reporte isso à minha dona em meu servidor de suporte!"))
      canal.send(embed).catch()
      console.error(err.stack)
    }
  }

  perm(perm) {
    let permissions = []

    perm.forEach(permissao => {
      switch (permissao) {
        case 'ADMINISTRATOR':
          permissions.push("Administrador")
          break;
        case 'CREATE_INSTANT_INVITE':
          permissions.push("Criar convite")
          break;
        case 'KICK_MEMBERS':
          permissions.push("Expulsar Membros")
          break;
        case 'BAN_MEMBERS':
          permissions.push("Banir Membros")
          break;
        case 'MANAGE_CHANNELS':
          permissions.push("Gerenciar Canais")
          break;
        case 'MANAGE_GUILD':
          permissions.push("Gerenciar Servidor")
          break;
        case 'ADD_REACTIONS':
          permissions.push("Adicionar Reações")
          break;
        case 'VIEW_AUDIT_LOG':
          permissions.push("Ver Registro de Auditoria")
          break;
        case 'VIEW_CHANNEL':
          permissions.push("Ler Mensagens")
          break;
        case 'SEND_MESSAGES':
          permissions.push("Enviar Mensagens")
          break;
        case 'SEND_TTS_MESSAGES':
          permissions.push("Enviar Mensagens em TTS")
          break;
        case 'MANAGE_MESSAGES':
          permissions.push("Gerenciar Mensagens")
          break;
        case 'EMBED_LINKS':
          permissions.push("Inserir Links")
          break;
        case 'ATTACH_FILES':
          permissions.push("Anexar Arquivos")
          break;
        case 'READ_MESSAGE_HISTORY':
          permissions.push("Ler histórico de Mensagens")
          break;
        case 'MENTION_EVERYONE':
          permissions.push("Mencionar Everyone")
          break;
        case 'USE_EXTERNAL_EMOJIS':
          permissions.push("Usar Emojis Externos")
          break;
        case 'CONNECT':
          permissions.push("Conectar")
          break;
        case 'SPEAK':
          permissions.push("Falar")
          break;
        case 'MUTE_MEMBERS':
          permissions.push("Silenciar Membros")
          break;
        case 'DEAFEN_MEMBERS':
          permissions.push("Desativar Áudio de Membros")
          break;
        case 'MOVE_MEMBERS':
          permissions.push("Mover Membros")
          break;
        case 'USE_VAD':
          permissions.push("Usar Atividade de Voz")
          break;
        case 'CHANGE_NICKNAME':
          permissions.push("Mudar Apelido")
          break;
        case 'MANAGE_NICKNAMES':
          permissions.push("Gerenciar Apelidos")
          break;
        case 'MANAGE_ROLES':
          permissions.push("Gerenciar Cargos")
          break;
        case 'MANAGE_WEBHOOK':
          permissions.push("Gerenciar WebHooks")
          break;
        case 'MANAGE_EMOJIS':
          permissions.push("Gerenciar Emojis")
          break;
      }
    })
    return permissions;
  }
}
