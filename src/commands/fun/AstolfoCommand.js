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

  async run({ message, args }, t) {
    if (!args[0]) return message.menheraReply('error', t('commands:astolfo.no-args'));

    const text = args.join(' ');

    const res = await NewHttp.astolfoRequest(text);

    if (res.err) return message.menheraReply('error', t('commands:http-error'));

    message.channel.send(message.author, new MessageAttachment(Buffer.from(res.data), 'astolfo.png'));
  }
};
