const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

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

    const rand = await getImageUrl('mamar');
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });
    const embed = new MessageEmbed()
      .setTitle(t('commands:mamar.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:mamar.embed_description')} ${mention}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);

    await user1.save();
    await authorData.save();
  }
};
