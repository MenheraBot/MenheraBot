const { MessageEmbed, Collection } = require('discord.js');
const i18next = require('i18next');
const moment = require('moment');
const Util = require('../utils/Util');
const makeRequest = require('../utils/HTTPrequests');

const cooldowns = new Collection();

module.exports = class MessageReceive {
  constructor(client) {
    this.client = client;
  }

  async notifyAfk(message, t, userIds) {
    const users = await this.client.database.Users.find({ id: { $in: userIds }, afk: true });

    users.forEach(async (data) => {
      const user = await this.client.users.fetch(data.id);
      message.menheraReply('notify', `${t('commands:afk.reason', { tag: user.tag, reason: data.afkReason })}`);
    });
  }

  async run(message) {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return;

    const server = await Util.databaseGuildEnsure(this.client, message.guild);
    const prefix = server.prefix?.toLowerCase() ?? this.client.config.prefix;
    const language = server?.lang ?? 'pt-BR';
    const t = i18next.getFixedT(language);

    message.mentions.users.delete(message.author.id);
    if (message.mentions.users.size >= 0) {
      this.notifyAfk(message, t, message.mentions.users.map((u) => u.id));
    }

    const authorData = await this.client.database.Users.findOne({ id: message.author.id });
    if (authorData?.afk) {
      authorData.afk = false;
      authorData.afkReason = null;
      authorData.save();
      message.menheraReply('wink', t('commands:afk.back'))
        .then((msg) => msg.delete({
          timeout: 5000,
        })).catch();
    }

    if (message.content.startsWith(`<@!${this.client.user.id}>`) || message.content.startsWith(`<@${this.client.user.id}>`)) {
      return message.menheraReply('wink', `${t('events:mention.start')} ${message.author}, ${t('events:mention.end', { prefix })}`);
    }

    if (!message.content.toLowerCase().startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    let command = cmd && this.client.commands.get(cmd);
    if (!command) command = this.client.commands.get(this.client.aliases.get(cmd));
    if (!command) return;

    if (server.blockedChannels?.includes(message.channel.id) && !message.member.hasPermission('MANAGE_CHANNELS')) {
      return message.menheraReply('error', `${t('events:blocked-channel')}`);
    }

    if (authorData?.ban) {
      const embed = new MessageEmbed()
        .setColor('#c1001d')
        .setAuthor(t('permissions:BANNED_EMBED.author'), message.author.displayAvatarURL())
        .setDescription(t('permissions:BANNED_EMBED.description', { user: message.author.username }))
        .addField(t('permissions:BANNED_EMBED.reason'), authorData?.banReason)
        .addField(t('permissions:BANNED_EMBED.field_start'), t('permissions:BANNED_EMBED.field_end'));

      message.channel.send(embed).catch(() => { message.author.send(embed).catch(); });
      return;
    }

    if (command.config.devsOnly) {
      if (!this.client.config.owner.includes(message.author.id)) return message.channel.send(t('permissions:ONLY_DEVS'));
    }

    if (command.maintenance) {
      if (!this.client.config.owner.includes(message.author.id)) {
        return message.channel.send(`<:negacao:759603958317711371> | ${t('events:maintenance', { reason: command.maintenanceReason })}`);
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
          return message.menheraReply('warn', t('events:cooldown', { time: timeLeft.toFixed(1), cmd: command.config.name }));
        }
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    if (command.config.userPermissions?.length) {
      const missing = message.channel.permissionsFor(message.author)
        .missing(command.config.userPermissions);
      if (missing.length) {
        const perm = missing.map((value) => t(`permissions:${value}`)).join(', ');
        return message.menheraReply('error', `${t('permissions:USER_MISSING_PERMISSION', { perm })}`);
      }
    }
    if (command.config.clientPermissions?.length) {
      const missing = message.channel.permissionsFor(this.client.user)
        .missing(command.config.clientPermissions);
      if (missing.length) {
        const perm = missing.map((value) => t(`permissions:${value}`)).join(', ');
        return message.menheraReply('error', `${t('permissions:CLIENT_MISSING_PERMISSION', { perm })}`);
      }
    }

    try {
      new Promise((res, _) => { // eslint-disable-line
        res(command.run({
          message, args, server, authorData,
        }, t));
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
      data: Date.now(),
    };
    await makeRequest.postCommand(data).catch();
  }
};
