import { MessageAttachment } from 'discord.js';
import NewHttp from '@utils/HTTPrequests';
import Command from '@structures/Command';
import CommandContext from '@structures/CommandContext';
import MenheraClient from '../../MenheraClient';

export default class AstolfoCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'astolfo',
      cooldown: 10,
      category: 'diversão',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    if (!ctx.args[0]) {
      await ctx.replyT('error', 'commands:astolfo.no-args');
      return;
    }
    const text = ctx.args.join(' ');

    const res = await NewHttp.astolfoRequest(text);

    if (res.err) {
      await ctx.replyT('error', 'commands:http-error');
      return;
    }

    await ctx.sendC(ctx.message.author.toString(), {
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'astolfo.png')],
    });
  }
}
