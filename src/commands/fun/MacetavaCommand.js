const { MessageAttachment } = require('discord.js');
const Command = require('../../structures/Command');
const NewHttp = require('../../utils/HTTPrequests');

module.exports = class MacetavaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'macetava',
      cooldown: 10,
      category: 'diversão',
      clientPermissions: ['ATTACH_FILES'],
    });
  }

  async run(ctx) {
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

    const res = await NewHttp.macetavaRequest(
      link,
      ctx.message.author.username,
      ctx.message.author.discriminator,
      ctx.message.author.displayAvatarURL({ format: 'png', size: 512 }),
    );
    if (res.err) return ctx.replyT('error', 'commands:http-error');

    ctx.sendC(ctx.message.author, new MessageAttachment(Buffer.from(res.data), 'macetava.png'));
  }
};
