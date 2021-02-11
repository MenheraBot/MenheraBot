const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class SarrarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sarrar',
      aliases: ['dance'],
      clientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const randSozinho = await getImageUrl('sarrar_sozinho');
    const user = message.mentions.users.first();

    if (!user) {
      const embed = new MessageEmbed()
        .setTitle(t('commands:sarrar.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(`${t('commands:sarrar.no-mention.embed_description_start')} ${message.author}?\n${t('commands:sarrar.no-mention.embed_description_end')}`)
        .setImage(randSozinho)
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter(t('commands:sarrar.no-mention.embed_footer'))
        .setAuthor(message.author.tag, message.author.displayAvatarURL());

      return message.channel.send(embed).then((msg) => {
        msg.react('✅').catch();
        const filter = (reaction, usuario) => reaction.emoji.name === '✅' && usuario.id !== message.author.id && !usuario.bot;

        const coletor = msg.createReactionCollector(filter, { max: 1, time: 30000 });

        coletor.on('collect', (_, colectorUser) => {
          msg.delete().catch();
          SarrarCommand.sarrada(message, colectorUser, t);
        });
      });
    } return SarrarCommand.sarrada(message, message.mentions.users.first(), t);
  }

  static async sarrada(message, reactUser, t) {
    const rand = await getImageUrl('sarrar');

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const Embed = new MessageEmbed()

      .setTitle(t('commands:sarrar.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:sarrar.embed_description')} ${reactUser}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(Embed);
  }
};
