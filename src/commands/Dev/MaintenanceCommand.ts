import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';
import { Message } from 'discord.js';

export default class MaintenanceCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'maintenance',
      aliases: ['cmd'],
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx: CommandContext): Promise<Message> {
    if (!ctx.args[0]) {
      return ctx.reply('error', 'você não informou o comando desejado');
    }

    const cmd =
      this.client.commands.get(ctx.args[0]) ||
      this.client.commands.get(this.client.aliases.get(ctx.args[0]) as string);
    if (!cmd) {
      return ctx.reply('error', 'este comando não existe');
    }

    const command = await this.client.repositories.cmdRepository.findByName(cmd.config.name);

    if (!command) {
      return ctx.reply('error', 'este comando não existe');
    }

    if (command.maintenance) {
      await this.client.repositories.maintenanceRepository.removeMaintenance(cmd.config.name);
      return ctx.reply('success', 'comando **REMOVIDO** da manutenção.');
    }
    const reason = ctx.args.slice(1).join(' ');
    await this.client.repositories.maintenanceRepository.addMaintenance(cmd.config.name, reason);

    return ctx.reply('success', 'comando **ADICIONADO** a manutenção.');
  }
}
