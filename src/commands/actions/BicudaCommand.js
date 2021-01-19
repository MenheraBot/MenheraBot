const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class BicudaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bicuda',
      aliases: ['chutar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const list = [
      'https://i.imgur.com/GoHtaA8.gif',
      'https://i.imgur.com/krh4BD6.gif',
      'https://i.imgur.com/ilRr5yw.gif',
      'https://i.imgur.com/UtWFnw1.gif',
      'https://i.imgur.com/17g1pkj.gif',
      'https://i.imgur.com/WjU3lxi.gif',
      'https://media.giphy.com/media/M1xhexGTyqk0Xfa07I/giphy.gif',
      'https://i.imgur.com/bZpnl52.gif',
      'https://i.imgur.com/SVE32ou.gif',
      'https://i.imgur.com/IinsyoH.gif',
      'https://i.imgur.com/XPWcusL.gif',
      'https://i.imgur.com/cnmw1FQ.gif',
      'https://i.imgur.com/GgCn5fn.gif',
      'https://i.imgur.com/TlNjwaw.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];
    const user = message.mentions.users.first();

    if (!user) {
      return message.menheraReply('error', t('commands:bicuda.no-mention'));
    }

    if (user && user.bot) return message.menheraReply('warn', t('commands:bicuda.bot'));

    if (user === message.author) {
      return message.menheraReply('error', t('commands:bicuda.self-mention'));
    }

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(t('commands:bicuda.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:bicuda.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    return message.channel.send(embed);
  }
};
