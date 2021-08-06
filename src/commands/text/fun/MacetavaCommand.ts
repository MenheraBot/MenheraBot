import { MessageAttachment } from 'discord.js';
import Command from '@structures/command/Command';
import NewHttp from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class MacetavaCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'macetava',
      cooldown: 10,
      category: 'diversão',
      clientPermissions: ['ATTACH_FILES'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    let link = ctx.message.author.displayAvatarURL({ format: 'png', size: 512 });

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
    const res = await NewHttp.macetavaRequest(
      link,
      ctx.message.author.username,
      ctx.message.author.discriminator,
      ctx.message.author.displayAvatarURL({ format: 'png', size: 512 }),
    );
    if (res.err) {
      await ctx.replyT('error', 'commands:http-error');
      return;
    }
    await ctx.sendC(ctx.message.author.toString(), {
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'macetava.png')],
    });
  }
}
