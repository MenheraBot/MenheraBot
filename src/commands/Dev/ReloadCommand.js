const Command = require('../../structures/Command');
const LocaleStructure = require('../../structures/LocaleStructure');

module.exports = class UpdateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reload',
      description: 'Updata um comando',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx) {
    if (!ctx.args[0]) return ctx.reply('error', 'nenhum comando foi informado!');

    if (ctx.args[0].toLowerCase() === 'locales') {
      const locale = new LocaleStructure();
      return locale
        .reload()
        .then(() => ctx.reply('success', 'locales reiniciados! :sparkles:'))
        .catch((e) => ctx.reply('error', `erro ao reiniciar os locales: ${e.message}`));
    }

    await this.client
      .reloadCommand(ctx.args[0])
      .catch((e) =>
        ctx.reply('error', `Erro ao reiniciar o comando ${ctx.args[0]}! : ${e.message}`),
      );

    ctx.reply('success', `${ctx.args[0]} recarregado com sucesso!`);
  }
};
