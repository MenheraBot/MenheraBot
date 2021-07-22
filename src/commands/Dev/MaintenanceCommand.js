const Command = require('../../structures/Command');

module.exports = class MaintenanceCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'maintenance',
      aliases: ['cmd'],
      description: 'Coloca ou tira um comando de manutenção',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx) {
    if (!ctx.args[0]) {
      return ctx.reply('error', 'você não informou o comando desejado');
    }

    const cmd =
      this.client.commands.get(ctx.args[0]) ||
      this.client.commands.get(this.client.aliases.get(ctx.args[0]));
    if (!cmd) {
      return ctx.reply('error', 'este comando não existe');
    }

    const command = await this.client.repositories.cmdRepository.findByName(cmd.config.name);

    if (command.maintenance) {
      this.client.repositories.maintenanceRepository.removeMaintenance(cmd.config.name);
      ctx.reply('success', 'comando **REMOVIDO** da manutenção.');
    } else {
      const reason = ctx.args.slice(1).join(' ');
      this.client.repositories.maintenanceRepository.addMaintenance(cmd.config.name, reason);

      ctx.reply('success', 'comando **ADICIONADO** a manutenção.');
    }
  }
};
