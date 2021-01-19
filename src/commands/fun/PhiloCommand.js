const { MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');
const { FiloBuilder } = require('../../utils/Canvas');

module.exports = class PhiloCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'philo',
      aliases: ['filo'],
      category: 'diversão',
    });
  }

  async run({ message, args }, t) {
    if (!args[0]) return t('commands:philo.no-args');

    const image = await FiloBuilder(args.join(' '));

    message.channel.send(message.author, new MessageAttachment(image, 'filosófico.png'));
  }
};
