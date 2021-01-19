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
      'https://i.imgur.com/yBITCWu.gif',
      'https://i.imgur.com/jyIaX0N.gif',
      'https://i.imgur.com/JuAUUi4.gif',
      'https://i.imgur.com/DN69AsK.gif',
      'https://i.imgur.com/bCZV7zu.gif',
      'https://i.imgur.com/p3pM4uI.gif',
      'https://i.imgur.com/83lVz7P.gif',
      'https://i.imgur.com/Sx7RnmE.gif',
      'https://i.imgur.com/7OtgIXK.gif',
      'https://i.imgur.com/MYfhHY4.gif',
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
