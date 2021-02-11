const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class HumorCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'humor',
      category: 'diversão',
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    });
  }

  async run({ message }, t) {
    if (message.deletable) message.delete();

    const rand = await getImageUrl('humor');

    const embed = new MessageEmbed()
      .setImage(rand)
      .setTitle(`${message.author.username} ${t('commands:humor.phrase')}`);

    message.channel.send(embed);
  }
};
