// const request = require('request');
const Command = require('../../structures/command');

module.exports = class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'test',
      aliases: ['natal'],
      description: 'Arquivo destinado para testes',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run({ message, args }) {
    const user = await this.client.users.fetch(args[0]);
    const canal = this.client.channels.cache.get('717061688729534632');
    const db = await this.client.database.Users.findOne({ id: args[0] });

    db.estrelinhas += 50000;
    db.rolls += 20;
    db.save();

    message.channel.send(`Presenteado ${user}`);
    canal.send(`**Feliz natal ${user}**\nVocê recebeu **50000** estrelinhas e **20** rolls de presente!`);
  }
};
