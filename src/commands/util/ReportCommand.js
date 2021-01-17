const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class ReportCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'report',
      aliases: ['reportar', 'bug'],
      cooldown: 5,
      category: 'util',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run({ message, args }, t) {
    const argumentos = args.join(' ');
    const cor = `#${(`000000${Math.random().toString(16).slice(2, 8).toUpperCase()}`).slice(-6)}`;

    if (!argumentos) return message.menheraReply('error', t('commands:report.no-args'));

    const embed = new MessageEmbed()
      .setDescription(`${argumentos}`)
      .setColor(cor)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setFooter(`ID do usuário: ${message.author.id}`)
      .setTimestamp()
      .setAuthor(`Novo Bug Reportado por ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

    const reportWebhook = await this.client.fetchWebhook(this.client.config.bug_webhook_id, this.client.config.bug_webhook_token);

    reportWebhook.send(embed);

    if (message.deletable) message.delete();
    message.menheraReply('success', t('commands:report.thanks'));
  }
};
