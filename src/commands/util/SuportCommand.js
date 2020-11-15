const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class SuportCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'support',
      aliases: ['suporte'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'util',
    });
  }

  async run({ message }, t) {
    const embed = new MessageEmbed()
      .setTitle(t('commands:support.embed_title'))
      .setURL('https://discord.gg/fZMdQbA')
      .setColor('#970045')
      .setImage('https://i.imgur.com/ZsKuh8W.png')
      .setFooter(`${t('commands:support.embed_footer')} ${message.author.tag}`, message.author.displayAvatarURL())
      .setTimestamp();
    message.channel.send(message.author, embed);
  }
};
