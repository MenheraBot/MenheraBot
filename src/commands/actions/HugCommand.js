const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class HugCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hug',
      aliases: ['abracar', 'abraçar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const list = [
      'https://i.imgur.com/r9aU2xv.gif',
      'https://i.imgur.com/wOmoeF8.gif',
      'https://i.imgur.com/BPLqSJC.gif',
      'https://i.imgur.com/ntqYLGl.gif',
      'https://i.imgur.com/4oLIrwj.gif',
      'https://i.imgur.com/6qYOUQF.gif',
      'https://i.imgur.com/nrdYNtL.gif',
      'https://i.imgur.com/6xsp74b.gif',
      'https://i.imgur.com/77nkAiZ.gif',
      'https://i.imgur.com/LOg4Mpr.gif',
      'https://i.imgur.com/gI5qiWQ.gif',
      'https://i.imgur.com/i5vwbos.gif',
      'https://i.imgur.com/14FwOef.gif',
      'https://i.imgur.com/RPYNm9o.gif',
      'https://i.imgur.com/kSWpxnG.gif',
      'https://i.imgur.com/itRyalr.gif',
      'https://i.imgur.com/k5YNtCq.gif',
      'https://i.imgur.com/lo6CHuQ.gif',
      'https://i.imgur.com/eArxfCN.gif',
      'https://i.imgur.com/jVMFrhQ.gif',
      'https://i.imgur.com/qRwoxNX.gif',
      'https://i.imgur.com/aXp20MT.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];
    const user = message.mentions.users.first();

    if (user && user.bot) return message.menheraReply('error', t('commands:hug.bot'));

    if (!user) {
      return message.menheraReply('error', t('commands:hug.no-mention'));
    }

    if (user === message.author) {
      return message.menheraReply('error', t('commands:hug.self-mention'));
    }

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(t('commands:hug.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:hug.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
