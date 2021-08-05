import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '../../../structures/Command';

export default class SayCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'say',
      aliases: ['dizer'],
      cooldown: 5,
      userPermissions: ['MANAGE_MESSAGES'],
      clientPermissions: ['MANAGE_MESSAGES'],
      category: 'util',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const sayMessage = ctx.args.join(' ');
    if (!sayMessage) {
      await ctx.replyT('error', 'commands:say.no-args');
      return;
    }
    if (ctx.message.deletable) await ctx.message.delete();
    await ctx.send(`${sayMessage}\n\n📢 | ${ctx.message.author}`);
  }
}
