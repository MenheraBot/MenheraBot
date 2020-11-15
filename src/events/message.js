const { MessageEmbed, Collection } = require('discord.js');
const i18next = require('i18next');

const cooldowns = new Collection();
const moment = require('moment');
const makeRequest = require('../utils/HTTPrequests');

module.exports = class MessageReceive {
  constructor(client) {
    this.client = client;
  }

  async run(message) {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return;

    const server = await this.getServerFromDatabase(message.guild.id);
    const prefix = (server?.prefix ?? this.client.config.prefix).toLowerCase();
    const language = server?.lang ?? 'pt-BR';
    const t = i18next.getFixedT(language);

    if (message.mentions.users.size >= 0) {
      message.mentions.users.forEach(async (member) => {
        if (!member) return;
        const usuario = await this.client.database.Users.findOne({ id: member.id });
        if (usuario && usuario.afk) {
          message.menheraReply('notify', `${t('commands:afk.reason', { tag: member.tag, reason: usuario.afkReason })}`).catch();
        }
      });
    }

    const user = await this.client.database.Users.findOne({ id: message.author.id });
    if (user && user.afk) {
      if (user.afk) {
        user.afk = false;
        user.afkReason = null;
        user.save();
        message.menheraReply('wink', `${t('commands:afk.back')}`)
          .then((msg) => msg.delete({ timeout: 5000 }))
          .catch();
      }
    }

    if (message.content.startsWith(`<@!${this.client.user.id}>`) || message.content.startsWith(`<@${this.client.user.id}>`)) {
      message.channel.send(`<:MenheraWink:767210250637279252> | ${t('events:mention.start')} ${message.author}, ${t('events:mention.end', { prefix })}`).catch();
      return;
    }

    if (!message.content.toLowerCase().startsWith(prefix)) return;

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
        shipValue: Math.floor(Math.random() * 55),
      }).save();
    }

    if (server && server.blockedChannels.includes(message.channel.id) && !message.member.hasPermission('MANAGE_CHANNELS')) {
      message.menheraReply('error', `${t('events:blocked-channel')}`);
      return;
    }

    if (user && user.ban) {
      const avatar = message.author.displayAvatarURL({ size: 2048, dynamic: true });

      const embed = new MessageEmbed()
        .setColor('#c1001d')
        .setAuthor(t('permissions:BANNED_EMBED.author'), avatar)
        .setDescription(t('permissions:BANNED_EMBED.description', { user: message.author.username }))
        .addField(t('permissions:BANNED_EMBED.reason'), user.banReason)
        .addField(t('permissions:BANNED_EMBED.field_start'), t('permissions:BANNED_EMBED.field_end'));

      message.channel.send(embed).catch(() => { message.author.send(embed).catch(); });
      return;
    }

    if (command.config.devsOnly && !this.client.config.owner.includes(message.author.id)) {
      message.channel.send(t('permissions:ONLY_DEVS'));

      return;
    }

    const c = await this.client.database.Cmds.findById(command.config.name);
    if (c.maintenance && !this.client.config.owner.includes(message.author.id)) {
      message.channel.send(`<:negacao:759603958317711371> | ${t('events:maintenance', { reason: c.maintenanceReason })}`);
      return;
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
          message.menheraReply('warn', t('events:cooldown', { time: timeLeft.toFixed(1), cmd: command.config.name }));
          return;
        }
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    const userPermission = command.config.userPermissions;
    const clientPermission = command.config.clientPermissions;
    if (userPermission !== null) {
      const missing = message.channel.permissionsFor(message.author).missing(userPermission);
      if (missing.length) {
        const perm = missing.map((value) => t(`permissions:${value}`)).join(', ');
        message.menheraReply('error', `${t('permissions:USER_MISSING_PERMISSION', { perm })}`);
        return;
      }
    }
    if (clientPermission !== null) {
      const missing = message.channel.permissionsFor(this.client.user).missing(clientPermission);
      if (missing.length) {
        const perm = missing.map((value) => t(`permissions:${value}`)).join(', ');
        message.menheraReply('error', `${t('permissions:CLIENT_MISSING_PERMISSION', { perm })}`);
        return;
      }
    }

    try {
      new Promise((res) => {
        res(command.run({ message, args, server }, t));
        console.log(`[COMANDO] ${command.config.name.toUpperCase()} | USER: ${message.author.tag} - ${message.author.id} | GUILD: ${message.guild.name} - ${message.guild.id}`);
      }).catch((err) => {
        const canal = this.client.channels.cache.get('730906866896470097');

        const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
        const embed = new MessageEmbed();
        embed.setColor('#fd0000');
        embed.setTitle(t('events:error_embed.title', { cmd: command.config.name }));
        embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);
        embed.addField('<:atencao:759603958418767922> | Usage', `UserId: \`${message.author.id}\` \nServerId: \`${message.guild.id}\``);
        embed.setTimestamp();
        embed.addField(t('events:error_embed.report_title'), t('events:error_embed.report_value'));

        message.channel.send(embed).catch(() => message.menheraReply('error', t('events:error_embed.error_msg')));
        canal.send(embed).catch();
      });
    } catch (err) {
      const canal = this.client.channels.cache.get('730906866896470097');

      const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
      const embed = new MessageEmbed();
      embed.setColor('#fd0000');
      embed.setTitle(t('events:error_embed.title', { cmd: command.config.name }));
      embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);
      embed.addField('<:atencao:759603958418767922> | Usage', `UserId: \`${message.author.id}\` \nServerId: \`${message.guild.id}\``);
      embed.setTimestamp();
      embed.addField(t('events:error_embed.report_title'), t('events:error_embed.report_value'));

      message.channel.send(embed).catch(() => message.menheraReply('error', t('events:error_embed.error_msg')));
      canal.send(embed).catch();
      console.error(err.stack);
    }
    moment.locale('pt-br');
    const data = {
      authorName: message.author.tag,
      authorId: message.author.id,
      guildName: message.guild.name,
      guildId: message.guild.id,
      commandName: command.config.name,
      data: moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a'),
    };
    await makeRequest.postCommand(data).catch();
  }

  async getServerFromDatabase(guildId) {
    const server = await this.client.database.Guilds.findOne({ id: guildId });
    if (server) {
      return server;
    }

    return new this.client.database.Guilds({ id: guildId });
  } 
};