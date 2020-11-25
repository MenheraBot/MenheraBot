const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class GrumbleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'grumble',
      aliases: ['resmungar', 'humpf'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const list = [
      'https://i.imgur.com/l1jwHGy.gif',
      'https://i.imgur.com/4co1K8h.gif',
      'https://i.imgur.com/XAcuQN9.gif',
      'https://i.imgur.com/JeolGmS.gif',
      'https://i.imgur.com/lGUJNbY.gif',
      'https://i.imgur.com/V9XR3VN.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];

    const embed = new MessageEmbed()
      .setTitle(t('commands:grumble.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:grumble.embed_description')}`)
      .setThumbnail(avatar)
      .setImage(rand)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
