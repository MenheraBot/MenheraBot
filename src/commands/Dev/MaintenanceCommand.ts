import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';

export default class MaintenanceCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'maintenance',
      aliases: ['cmd'],
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    if (!ctx.args[0]) {
      await ctx.reply('error', 'você não informou o comando desejado');
      return;
    }

    const cmd =
      this.client.commands.get(ctx.args[0]) ||
      this.client.commands.get(this.client.aliases.get(ctx.args[0]) as string);
    if (!cmd) {
      await ctx.reply('error', 'este comando não existe');
      return;
    }

    const command = await this.client.repositories.cacheRepository.fetchCommand(cmd.config.name);

    if (!command) {
      await ctx.reply('error', 'este comando não existe');
      return;
    }

    if (command.maintenance) {
      await this.client.repositories.maintenanceRepository.removeMaintenance(cmd.config.name);
      await this.client.repositories.cacheRepository.updateCommand(cmd.config.name, {
        maintenance: false,
        maintenanceReason: null,
      });
      await ctx.reply('success', 'comando **REMOVIDO** da manutenção.');
      return;
    }
    const reason = ctx.args.slice(1).join(' ');
    await this.client.repositories.maintenanceRepository.addMaintenance(cmd.config.name, reason);
    await this.client.repositories.cacheRepository.updateCommand(cmd.config.name, {
      maintenance: true,
      maintenanceReason: reason,
    });

    await ctx.reply('success', 'comando **ADICIONADO** a manutenção.');
  }
}
