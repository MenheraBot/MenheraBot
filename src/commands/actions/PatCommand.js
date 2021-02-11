const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class PatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pat',
      aliases: ['carinho', 'cuddle'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const rand = await getImageUrl('pat');
    const user = message.mentions.users.first();

    if (!user) return message.menheraReply('error', t('commands:pat.no-mention'));

    if (user === message.author) return message.menheraReply('error', t('commands:pat.self-mention'));

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(t('commands:pat.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:pat.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
