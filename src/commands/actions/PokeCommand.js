const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class PokeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'poke',
      aliases: ['cutucar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const list = [
      'https://i.imgur.com/ZWfpRM4.gif',
      'https://i.imgur.com/wLEViR5.gif',
      'https://i.imgur.com/oS4Rsi3.gif',
      'https://i.imgur.com/PxpyxfK.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];
    const user = message.mentions.users.first();

    if (!user) return message.menheraReply('error', t('commands:poke.no-mention'));

    if (user === message.author) return message.menheraReply('error', t('commands:poke.self-mention'));

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(t('commands:poke.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:poke.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
