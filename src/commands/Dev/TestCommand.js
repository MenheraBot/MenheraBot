const Command = require('../../structures/command');

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
    const oi = await this.client.database.Users.findOne({ id: message.author.id });

    oi.cores.pop();
    oi.save();
    message.menheraReply('success', 'dakle');
  }
};
