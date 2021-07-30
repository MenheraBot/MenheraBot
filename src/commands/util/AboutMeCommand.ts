import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
import { Message } from 'discord.js';

export default class AboutMeCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'aboutme',
      aliases: ['sobremim'],
      cooldown: 10,
      category: 'util',
    });
  }

  async run(ctx: CommandContext): Promise<Message> {
    const nota = ctx.args.join(' ');
    if (!nota) return ctx.replyT('error', 'commands:aboutme.no-args');
    if (nota.length > 200) return ctx.replyT('error', 'commands:aboutme.args-limit');

    await ctx.client.repositories.userRepository.update(ctx.message.author.id, { nota });

    return ctx.replyT('success', 'commands:aboutme.success');
  }
}
