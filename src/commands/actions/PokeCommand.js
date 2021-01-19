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
      'https://i.imgur.com/5m6q8e5.gif',
      'https://i.imgur.com/q4aLIrg.gif',
      'https://i.imgur.com/PJs4mtp.gif',
      'https://i.imgur.com/PcLO8vr.gif',
      'https://i.imgur.com/zfsKn8r.gif',
      'https://i.imgur.com/MhkIn0t.gif',
      'https://i.imgur.com/Prmh4Zi.gif',
      'https://i.imgur.com/6U1TX89.gif',
      'https://i.imgur.com/pyX3MWj.gif',
      'https://i.imgur.com/75sJN4G.gif',
      'https://i.imgur.com/tSrH9ub.gif',
      'https://i.imgur.com/KA9ddTe.gif',
      'https://i.imgur.com/kPgAC0V.gif',
      'https://i.imgur.com/eAgz1t5.gif',
      'https://i.imgur.com/3NAoYmv.gif',
      'https://i.imgur.com/WIPeZsC.gif',
      'https://i.imgur.com/AlFTFtm.gif',
      'https://i.imgur.com/xzTdc6X.gif',
      'https://i.imgur.com/A7xdRez.gif',
      'https://i.imgur.com/TwCf8Yp.gif',
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
