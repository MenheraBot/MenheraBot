const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class KillCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kill',
      aliases: ['matar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const list = [
      'https://i.imgur.com/teca6na.gif',
      'https://i.imgur.com/XaqZPBf.gif',
      'https://i.imgur.com/Kj331EJ.gif',
      'https://i.imgur.com/kzW8Lpc.gif',
      'https://i.imgur.com/b9byUSu.gif',
      'https://i.imgur.com/gsFgkDh.gif',
      'https://i.imgur.com/cndXyGW.gif',
      'https://i.imgur.com/a3YG32H.gif',
      'https://i.imgur.com/6I9QAJ7.gif',
      'https://i.imgur.com/jOG5s44.gif',
      'https://i.imgur.com/KEPoeOo.gif',
      'https://i.imgur.com/FM5BZK6.gif',
      'https://i.imgur.com/lCzdLJC.gif',
      'https://i.imgur.com/5qnXMrF.gif',
      'https://i.imgur.com/JK94J43.gif',
      'https://i.imgur.com/1QL4IXU.gif',
      'https://i.imgur.com/QRr6zD4.gif',
      'https://i.imgur.com/b3DeNsk.gif',
      'https://i.imgur.com/wfPey7f.gif',
      'https://i.imgur.com/jrY7j2q.gif',
      'https://i.imgur.com/L35jwgH.gif',
      'https://i.imgur.com/l9jq01c.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];
    const user = message.mentions.users.first();
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (!user) {
      return message.menheraReply('error', t('commands:kill.no-mention'));
    }

    if (user === message.author) {
      return message.menheraReply('error', t('commands:kill.self-mention'));
    }

    if (user.bot) {
      // links de robos
      const ro = [
        'https://i.imgur.com/tv9wQai.gif',
        'https://i.imgur.com/X9uUyEB.gif',
        'https://i.imgur.com/rtsjxWQ.gif',
      ];

      const Rrand = ro[Math.floor(Math.random() * ro.length)];

      const Rembed = new MessageEmbed()
        .setTitle(t('commands:kill.bot.embed_title'))
        .setColor('#000000')
        .setDescription(`${t('commands:kill.bot.embed_description_start')} \n${message.author} ${t('commands:kill.bot.embed_description_end')} ${user}`)
        .setImage(Rrand)
        .setThumbnail(avatar)
        .setAuthor(message.author.tag, avatar);

      return message.channel.send(Rembed);
    }

    const embed = new MessageEmbed()
      .setTitle(t('commands:kill.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:kill.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
