const { MessageAttachment } = require('discord.js');
const Command = require('../../structures/Command');
const NewHttp = require('../../utils/HTTPrequests');

module.exports = class PhiloCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'philo',
      aliases: ['filo'],
      category: 'diversão',
      clientPermissions: ['ATTACH_FILES'],
    });
  }

  async run(ctx) {
    if (!ctx.args[0]) return ctx.replyT('error', 'commands:philo.no-args');

    const text = ctx.args.join(' ');

    const res = await NewHttp.philoRequest(text);

    if (res.err) return ctx.replyT('error', 'commands:http-error');

    ctx.sendC(ctx.message.author, new MessageAttachment(Buffer.from(res.data), 'filosófico.png'));
  }
};
