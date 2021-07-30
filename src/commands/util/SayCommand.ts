import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import { Message } from 'discord.js';
import Command from '../../structures/Command';

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

  async run(ctx: CommandContext): Promise<Message> {
    const sayMessage = ctx.args.join(' ');
    if (!sayMessage) return ctx.replyT('error', 'commands:say.no-args');
    if (ctx.message.deletable) await ctx.message.delete();
    return ctx.send(`${sayMessage}\n\n📢 | ${ctx.message.author}`);
  }
}
