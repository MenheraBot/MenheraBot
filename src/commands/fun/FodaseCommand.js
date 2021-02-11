const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class FodaseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'fodase',
      aliases: ['fds', 'fuck'],
      category: 'diversão',
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    });
  }

  async run({ message }) {
    if (message.deletable) message.delete();

    const frases = [
      `${message.author.username} disse que fodase`,
      'Inteligente, pena que fodase',
      'Ta, e o fodase?',
    ];

    const frasesUsada = frases[Math.floor(Math.random() * frases.length)];
    const rand = await getImageUrl('fodase');

    const embed = new MessageEmbed()
      .setImage(rand)
      .setFooter(`Autor: ${message.author.username}`)
      .setTitle(frasesUsada);

    message.channel.send(embed);
  }
};
