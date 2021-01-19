const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

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
    const listaSozinho = [
      'https://media1.tenor.com/images/e0b093e5174a74518ffcbc0967d265eb/tenor.gif?itemid=17767202',
      'https://i.imgur.com/XBcmgBR.png',
      'https://i.imgur.com/GZtx3i8.gif',
    ];

    const randSozinho = listaSozinho[Math.floor(Math.random() * listaSozinho.length)];
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

  static sarrada(message, reactUser, t) {
    const lista = [
      'https://i.imgur.com/m2JUJWB.gif',
      'https://i.imgur.com/ezdhV96.gif',
      'https://i.imgur.com/opU9zt9.gif',
    ];

    const rand = lista[Math.floor(Math.random() * lista.length)];

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
