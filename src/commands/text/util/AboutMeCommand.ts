import Command from '@structures/command/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class AboutMeCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'aboutme',
      aliases: ['sobremim'],
      cooldown: 10,
      category: 'util',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const nota = ctx.args.join(' ');
    if (!nota) {
      await ctx.replyT('error', 'commands:aboutme.no-args');
      return;
    }
    if (nota.length > 200) {
      await ctx.replyT('error', 'commands:aboutme.args-limit');
      return;
    }

    await ctx.client.repositories.userRepository.update(ctx.message.author.id, { nota });

    await ctx.replyT('success', 'commands:aboutme.success');
  }
}
