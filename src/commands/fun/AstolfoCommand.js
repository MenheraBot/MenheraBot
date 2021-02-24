const { MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');
const { AstolfoCommandBuilder } = require('../../utils/Canvas');

module.exports = class AstolfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'astolfo',
      category: 'diversão',
    });
  }

  async run({ message, args }, t) {
    if (!args[0]) return message.menheraReply('error', t('commands:astolfo.no-args'));

    const CanvasImage = await AstolfoCommandBuilder(args.join(' '));

    message.channel.send(message.author, new MessageAttachment(CanvasImage, 'astolfo.png'));
  }
};
