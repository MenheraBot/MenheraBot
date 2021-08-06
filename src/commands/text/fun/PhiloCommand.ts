import { MessageAttachment } from 'discord.js';
import Command from '@structures/command/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class PhiloCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'philo',
      aliases: ['filo'],
      category: 'diversão',
      clientPermissions: ['ATTACH_FILES'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    if (!ctx.args[0]) {
      await ctx.replyT('error', 'commands:philo.no-args');
      return;
    }

    const text = ctx.args.join(' ');

    const res = await http.philoRequest(text);

    if (res.err) {
      await ctx.replyT('error', 'commands:http-error');
      return;
    }

    await ctx.sendC(ctx.message.author.toString(), {
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'filosófico.png')],
    });
  }
}
