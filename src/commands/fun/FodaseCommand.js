const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');
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

  async run(ctx) {
    if (ctx.message.deletable) ctx.message.delete();

    const frases =
      ctx.data.server.lang === 'pt-BR'
        ? [
            `${ctx.message.author.username} disse que fodase`,
            'Inteligente, pena que fodase',
            'Ta, e o fodase?',
          ]
        : [
            `${ctx.message.author.username} said it dont care`,
            'Nice, but fuck it',
            "Cool, but i don't care",
          ];

    const frasesUsada = frases[Math.floor(Math.random() * frases.length)];
    const rand = await getImageUrl('fodase');

    const embed = new MessageEmbed()
      .setImage(rand)
      .setFooter(`Autor: ${ctx.message.author.username}`)
      .setTitle(frasesUsada);

    ctx.send(embed);
  }
};
