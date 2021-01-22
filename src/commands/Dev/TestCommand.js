/* const { MessageAttachment } = require('discord.js'); */
/* const { MessageAttachment } = require('discord.js'); */
const Command = require('../../structures/command');

module.exports = class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'test',
      description: 'Arquivo destinado para testes',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(/* { message, args }, t */) {
    /* const user = await this.client.database.Rpg.findById(message.author.id);
    delete require.cache[require.resolve('../../utils/Canvas')];
    const Canvas = require('../../utils/Canvas');
    const familia = await this.client.database.Familias.findById(user.familyName);
    const image = await Canvas.RpgStatusBuilder(user, message.author, t, familia);

    message.channel.send(message.author, new MessageAttachment(image, 'filosófico.png')); */
  }
};
