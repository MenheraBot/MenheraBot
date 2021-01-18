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
    const webhook = await this.client.fetchWebhook(this.client.config.family_webhook_id, this.client.config.family_webhook_token);
    webhook.send(`\`${this.client.users.cache.get(message.author.id).tag}\` dale dele`);
  }
};
