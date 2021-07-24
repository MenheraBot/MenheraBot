import { MessageAttachment } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class PhiloCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'philo',
      aliases: ['filo'],
      category: 'diversão',
      clientPermissions: ['ATTACH_FILES'],
    });
  }

  async run(ctx: CommandContext) {
    if (!ctx.args[0]) return ctx.replyT('error', 'commands:philo.no-args');

    const text = ctx.args.join(' ');

    const res = await http.philoRequest(text);

    if (res.err) return ctx.replyT('error', 'commands:http-error');

    ctx.sendC(ctx.message.author.toString(), {
      files: [new MessageAttachment(Buffer.from(res.data), 'filosófico.png')],
    });
  }
}
