const { MessageAttachment } = require('discord.js');
const NewHttp = require('../../utils/NewHttp');
const Command = require('../../structures/command');

module.exports = class AstolfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'astolfo',
      category: 'diversão',
    });
  }

  async run(ctx) {
    if (!ctx.args[0]) return ctx.replyT('error', 'commands:astolfo.no-args');

    const text = ctx.args.join(' ');

    const res = await NewHttp.astolfoRequest(text);

    if (res.err) return ctx.replyT('error', 'commands:http-error');

    ctx.send(ctx.message.author, new MessageAttachment(Buffer.from(res.data), 'astolfo.png'));
  }
};
