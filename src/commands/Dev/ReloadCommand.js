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
    if (args[0] && args[0].toLowerCase() === 'locales') {
      return this.client.reloadLocales()
        .then(() => message.menheraReply('success', 'locales reiniciados!'))
        .catch(() => message.menheraReply('error', 'erro ao reiniciar os locales'));
    }

    const option = Command.getOption(args[0], ['command', 'comando'], ['evento', 'event']);
    if (!option) return message.menheraReply('error', 'me dê uma opção válida. Opções disponíveis: `evento`, `comando`');
    if (!args[1]) return message.menheraReply('error', 'me dê um comando/evento para recarregar.');
    const type = option === 'yes' ? 'comando' : 'evento';

    const rst = option === 'yes' ? this.client.reloadCommand(args[1]) : this.client.reloadEvent(args[1]);
    if (rst instanceof Error) return message.menheraReply('error', `falha no recarregamento do ${type}.Stack:\n\`\`\`js${rst}\`\`\``);
    if (rst === false) return message.channel.send(`${type} inexistente.`);

    return message.menheraReply('success', `${type} recarregado com sucesso!`);
  }
};
