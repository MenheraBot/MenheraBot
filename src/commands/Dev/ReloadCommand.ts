import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';
import LocaleStructure from '@structures/LocaleStructure';
import { Message } from 'discord.js';

export default class UpdateCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'reload',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx: CommandContext): Promise<Message> {
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

    return ctx.reply('success', `${ctx.args[0]} recarregado com sucesso!`);
  }
}
