const { MessageEmbed, MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');
const Canvas = require('../../utils/Canvas');

module.exports = class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'test',
      aliases: ['pcm'],
      description: 'Arquivo destinado para testes',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run({ message }) {
    const ship = await Canvas.ShipImage();

    const embed = new MessageEmbed()
      .attachFiles(new MessageAttachment(ship, 'ship.png'))
      .setImage('attachment://ship.png');

    message.channel.send(message.author, embed);
  }
};
