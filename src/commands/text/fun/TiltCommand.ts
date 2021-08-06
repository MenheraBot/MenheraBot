import { MessageEmbed } from 'discord.js';
import Command from '@structures/command/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class HumorCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'tilt',
      aliases: ['tiltado', 'tiltas'],
      category: 'diversão',
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    if (ctx.message.deletable) await ctx.message.delete();

    const mention = ctx.message.mentions.users.first();

    const list = ['https://i.imgur.com/HNZeSQt.png'];

    const rand = list[Math.floor(Math.random() * list.length)];

    const embed = new MessageEmbed()
      .setImage(rand)
      .setFooter(`${ctx.locale('commands:tilt.footer')} ${ctx.message.author.username}`);

    if (!mention) {
      embed.setDescription(ctx.locale('commands:tilt.phrase'));
    } else {
      embed.setDescription(`${ctx.locale('commands:tilt.phrase-mention')} ${mention}`);
    }

    await ctx.send(embed);
  }
}
