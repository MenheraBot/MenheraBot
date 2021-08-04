import { MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class FodaseCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'fodase',
      aliases: ['fds', 'fuck'],
      category: 'diversão',
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    if (ctx.message.deletable) await ctx.message.delete();

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
    const rand = await http.getAssetImageUrl('fodase');

    const embed = new MessageEmbed()
      .setImage(rand)
      .setFooter(`Autor: ${ctx.message.author.username}`)
      .setTitle(frasesUsada);

    await ctx.send(embed);
  }
}
