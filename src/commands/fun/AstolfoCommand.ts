import { Message, MessageAttachment } from 'discord.js';
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

  async run(ctx: CommandContext): Promise<Message | Message[]> {
    if (!ctx.args[0]) return ctx.replyT('error', 'commands:astolfo.no-args');

    const text = ctx.args.join(' ');

    const res = await NewHttp.astolfoRequest(text);

    if (res.err) return ctx.replyT('error', 'commands:http-error');

    return ctx.sendC(ctx.message.author.toString(), {
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'astolfo.png')],
    });
  }
}
