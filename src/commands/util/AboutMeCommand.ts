import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class AboutMeCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'aboutme',
      aliases: ['sobremim'],
      cooldown: 10,
      category: 'util',
    });
  }

  async run(ctx: CommandContext) {
    const nota = ctx.args.join(' ');
    if (!nota) return ctx.replyT('error', 'commands:aboutme.no-args');
    if (nota.length > 200) return ctx.replyT('error', 'commands:aboutme.args-limit');

    await ctx.client.database.Users.updateOne({ id: ctx.message.author.id }, { $set: { nota } });

    ctx.replyT('success', 'commands:aboutme.success');
  }
}
