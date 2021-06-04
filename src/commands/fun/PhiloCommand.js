const { MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');
const NewHttp = require('../../utils/NewHttp');

module.exports = class PhiloCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'philo',
      aliases: ['filo'],
      category: 'diversão',
      clientPermissions: ['ATTACH_FILES'],
    });
  }

  async run({ message, args }, t) {
    if (!args[0]) return message.menheraReply('error', t('commands:philo.no-args'));

    const text = args.join(' ');

    const res = await NewHttp.philoRequest(text);

    if (res.err) return message.menheraReply('error', t('commands:http-error'));

    message.channel.send(message.author, new MessageAttachment(Buffer.from(res.data), 'filosófico.png'));
  }
};
