const { MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');
const NewHttp = require('../../utils/NewHttp');

module.exports = class GadoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'gado',
      aliases: ['simp'],
      cooldown: 10,
      category: 'diversão',
      clientPermissions: ['ATTACH_FILES'],
    });
  }

  async run(ctx) {
    let link = ctx.message.author.displayAvatarURL({ format: 'png', size: 512 });

    if (ctx.message.mentions.users.first()) link = ctx.message.mentions.users.first().displayAvatarURL({ format: 'png', size: 512 });

    if (ctx.message.attachments.first()) link = ctx.message.attachments.first().url;

    const res = await NewHttp.gadoRequest(link);
    if (res.err) return ctx.replyT('error', 'commands:http-error');

    ctx.sendC(ctx.message.author, new MessageAttachment(Buffer.from(res.data), 'gado.png'));
  }
};
