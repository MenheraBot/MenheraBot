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

  async run({ message, server }) {
    if (message.deletable) message.delete();

    const frases = (server.lang === 'pt-BR') ? [
      `${message.author.username} disse que fodase`,
      'Inteligente, pena que fodase',
      'Ta, e o fodase?',
    ] : [`${message.author.username} said it dont care`,
      'Nice, but fuck it',
      'Cool, but i don\'t care'];

    const frasesUsada = frases[Math.floor(Math.random() * frases.length)];
    const rand = await getImageUrl('fodase');

    const embed = new MessageEmbed()
      .setImage(rand)
      .setFooter(`Autor: ${message.author.username}`)
      .setTitle(frasesUsada);

    message.channel.send(embed);
  }
};
