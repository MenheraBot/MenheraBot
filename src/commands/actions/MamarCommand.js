const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class MamarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'mamar',
      aliases: ['suck', 'sugada'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message, authorData: selfData }, t) {
    const mention = message.mentions.users.first();

    if (!mention) return message.menheraReply('error', t('commands:mamar.no-mention'));

    if (mention.bot) return message.menheraReply('warn', `${t('commands:mamar.bot')} ${mention}`);

    if (mention === message.author) return message.menheraReply('error', t('commands:mamar.self-mention'));

    let user1 = await this.client.database.Users.findOne({ id: mention.id });

    const authorData = selfData ?? new this.client.database.Users({ id: message.author.id });

    if (!user1) {
      user1 = new this.client.database.Users({ id: mention.id });
    }

    user1.mamadas += 1;
    authorData.mamou += 1;

    const list = [
      'https://i.imgur.com/PlAtqkk.gif',
      'https://i.imgur.com/LjuLhYq.gif',
      'https://i.imgur.com/zvZ2AiM.gif',
      'https://i.imgur.com/xRBDmXD.gif',
      'https://i.imgur.com/JF5FaNC.gif',
      'https://i.imgur.com/ZAx2dOC.gif',
      'https://i.imgur.com/t1aaEMY.gif',
      'https://i.imgur.com/GEB31Fi.gif',
      'https://i.imgur.com/OMzXpXR.gif',
      'https://i.imgur.com/9DYjWtP.gif',
      'https://i.imgur.com/5Tjpori.gif',
      'https://i.imgur.com/vejOIZc.gif',
      'https://i.imgur.com/qyjOnix.gif',
      'https://i.imgur.com/J3K2d9A.gif',
      'https://i.imgur.com/JgXWxWf.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];
    const avatar = message.author.displayAvatarURL({ format: 'png' });
    const embed = new MessageEmbed()
      .setTitle(t('commands:mamar.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:mamar.embed_description')} ${mention}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);

    user1.save();
    authorData.save();
  }
};
