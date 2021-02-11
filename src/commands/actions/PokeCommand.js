const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

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
    const rand = await getImageUrl('poke');
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
