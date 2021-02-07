const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class SlapCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'slap',
      aliases: ['tapa'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const list = [
      'https://i.imgur.com/XqtlhuZ.gif',
      'https://i.imgur.com/HcTCdJ1.gif',
      'https://i.imgur.com/mdZR2D2.gif',
      'https://i.imgur.com/Li9mx3A.gif',
      'https://i.imgur.com/kVI9SHf.gif',
      'https://i.imgur.com/fm49srQ.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];
    const user = message.mentions.users.first();

    if (user && user.bot) return message.menheraReply('error', t('commands:slap.bot'));

    if (!user) return message.menheraReply('error', t('commands:slap.no-mention'));

    if (user === message.author) return message.menheraReply('error', t('commands:slap.self-mention'));

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(t('commands:slap.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:slap.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
