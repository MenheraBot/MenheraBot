import { Message, MessageAttachment } from 'discord.js';
import Command from '@structures/Command';
import NewHttp from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class MacetavaCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'macetava',
      cooldown: 10,
      category: 'diversão',
      clientPermissions: ['ATTACH_FILES'],
    });
  }

  async run(ctx: CommandContext): Promise<Message | Message[]> {
    let link = ctx.message.author.displayAvatarURL({ format: 'png', size: 512 });

    const MentionedUser = ctx.message.mentions.users.first();
    const referencedMessage = ctx.message.reference?.messageID;
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
    if (res.err) return ctx.replyT('error', 'commands:http-error');

    return ctx.sendC(ctx.message.author.toString(), {
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'macetava.png')],
    });
  }
}
