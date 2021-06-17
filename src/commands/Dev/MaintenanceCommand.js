const Command = require('../../structures/command');

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

    const cmd = this.client.commands.get(ctx.args[0]) || this.client.commands.get(this.client.aliases.get(ctx.args[0]));
    if (!cmd) {
      return ctx.reply('error', 'este comando não existe');
    }

    const command = await this.client.database.repositories.cmdRepository.findByName(cmd.config.name);
    const mainStatus = await this.client.database.Status.findById('main');

    if (command.maintenance) {
      command.maintenance = false;
      command.maintenanceReason = '';
      mainStatus.disabledCommands.splice(mainStatus.disabledCommands.findIndex((c) => c.name === cmd.name), 1);
      await command.save().then(() => {
        ctx.reply('success', 'comando **REMOVIDO** da manutenção.');
      });
    } else {
      const reason = ctx.args.slice(1).join(' ');
      command.maintenance = true;
      command.maintenanceReason = reason;
      mainStatus.disabledCommands.push({ name: cmd.config.name, reason });
      await command.save().then(() => {
        ctx.reply('success', 'comando **ADICIONADO** a manutenção.');
      });
    }
    await mainStatus.save();
  }
};
