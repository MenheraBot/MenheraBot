import { MessageAttachment } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';

export default class GadoCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'gado',
      aliases: ['simp'],
      cooldown: 10,
      category: 'diversão',
      clientPermissions: ['ATTACH_FILES'],
    });
  }

  async run(ctx: CommandContext) {
    let link = ctx.message.author.displayAvatarURL({ format: 'png', size: 512 });

    if (ctx.message.mentions.users.first())
      link = ctx.message.mentions.users.first().displayAvatarURL({ format: 'png', size: 512 });

    if (ctx.message?.reference?.messageID) {
      const fetchedMessage = await ctx.message.channel.messages.fetch(
        ctx.message.reference.messageID,
      );
      if (fetchedMessage.attachments.first()) link = fetchedMessage.attachments.first().url;
    }

    if (ctx.message.attachments.first()) link = ctx.message.attachments.first().url;

    const res = await http.gadoRequest(link);
    if (res.err) return ctx.replyT('error', 'commands:http-error');

    ctx.sendC(ctx.message.author.toString(), {
      files: [new MessageAttachment(Buffer.from(res.data), 'gado.png')],
    });
  }
}
