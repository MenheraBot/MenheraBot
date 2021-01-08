const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class SuggestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'suggest',
      aliases: ['sugerir', 'sugestão'],
      cooldown: 5,
      category: 'util',
    });
  }

  async run({ message, args }, t) {
    const argumentos = args.join(' ');
    const cor = `#${(`000000${Math.random().toString(16).slice(2, 8).toUpperCase()}`).slice(-6)}`;

    if (!argumentos) return message.menheraReply('error', t('commands:suggest.no-args'));

    const embed = new MessageEmbed()
      .setDescription(`**${argumentos}**`)
      .setColor(cor)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setFooter(`ID do usuário: ${message.author.id} | ${message.id}`)
      .setTimestamp()
      .setAuthor(`Sugestão de ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

    this.client.guilds.cache.get('717061688460967988').channels.cache.get('723765136648830996').send(embed).then((m) => {
      m.react('✅');
      m.react('❌');
    });

    if (message.deletable) message.delete();
    message.menheraReply('heart', t('commands:suggest.thanks'));
  }
};
