import { MessageAttachment } from 'discord.js';
import Command from '@structures/command/Command';
import http from '@utils/HTTPrequests';
import CommandContext from '@structures/command/CommandContext';
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

  async run(ctx: CommandContext): Promise<void> {
    let link: string = ctx.message.author.displayAvatarURL({
      format: 'png',
      size: 512,
    });

    const MentionedUser = ctx.message.mentions.users.first();
    const referencedMessage = ctx.message.reference?.messageId;
    const attachment = ctx.message.attachments.first();

    if (MentionedUser) {
      link = MentionedUser.displayAvatarURL({ format: 'png', size: 512 });
    }

    if (referencedMessage) {
      const fetchedMessage = await ctx.message.channel.messages.fetch(referencedMessage);
      const fetched = fetchedMessage.attachments.first();
      if (fetched) link = fetched.url;
    }

    if (attachment) link = attachment.url;

    const res = await http.gadoRequest(link);
    if (res.err) {
      await ctx.replyT('error', 'commands:http-error');
      return;
    }

    await ctx.sendC(ctx.message.author.toString(), {
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'gado.png')],
    });
  }
}
