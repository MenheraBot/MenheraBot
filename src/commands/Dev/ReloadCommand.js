const Command = require('../../structures/command');

module.exports = class UpdateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reload',
      description: 'Updata um comando',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run({ message, args }) {
    if (!args[0]) return message.menheraReply('error', 'nenhum comando foi informado!');

    if (args[0].toLowerCase() === 'locales') {
      this.client.shard.broadcastEval(`
      const LocaleStructure = require('../../structures/LocaleStructure');
      const locale = new LocaleStructure();
      return locale.reload()
        .then(() => message.menheraReply('success', 'locales reiniciados! :sparkles:'))
        .catch((e) => message.menheraReply('error', 'erro ao reiniciar os locales: ' + e.message))`);
    }

    // eslint-disable-next-line no-template-curly-in-string
    await this.client.shard.broadcastEval('this.client.reloadCommand(args[0]).catch((e) => message.menheraReply("error", `Erro ao reiniciar o comando ${args[0]}! : ${e.message}`))');

    message.menheraReply('success', `${args[0]} recarregado com sucesso!`);
  }
};
