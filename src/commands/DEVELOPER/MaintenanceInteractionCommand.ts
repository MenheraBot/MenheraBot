import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import HttpRequests from '@utils/HTTPrequests';

export default class MaintenanceSlashInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'manutencao',
      description: 'Coloca ou tira um comando da manutencao',
      category: 'dev',
      options: [
        {
          type: 'STRING',
          name: 'comando',
          description: 'Comando pra mete em maintenance',
          required: true,
        },
        {
          name: 'motivo',
          description: 'Motivo da manutencao',
          type: 'STRING',
          required: false,
        },
      ],
      defaultPermission: false,
      devsOnly: true,
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const cmd = ctx.client.slashCommands.get(ctx.options.getString('comando', true));
    if (!cmd) {
      await ctx.makeMessage({ content: 'este comando não existe' });
      return;
    }

    const command = await ctx.client.repositories.cacheRepository.fetchCommand(cmd.config.name);

    if (!command) {
      await ctx.makeMessage({ content: 'este comando não existe' });
      return;
    }

    if (command.maintenance) {
      await ctx.client.repositories.maintenanceRepository.removeMaintenance(cmd.config.name);
      await ctx.client.repositories.cacheRepository.updateCommand(cmd.config.name, {
        maintenance: false,
        maintenanceReason: null,
      });
      await HttpRequests.updateCommandStatusMaintenance(cmd.config.name, {
        isDisabled: false,
        reason: null,
      });
      await ctx.makeMessage({ content: 'comando **REMOVIDO** da manutenção.' });
      return;
    }
    const reason = ctx.options.getString('motivo') ?? 'Sem motivo informado';
    await ctx.client.repositories.maintenanceRepository.addMaintenance(cmd.config.name, reason);
    await ctx.client.repositories.cacheRepository.updateCommand(cmd.config.name, {
      maintenance: true,
      maintenanceReason: reason,
    });

    await HttpRequests.updateCommandStatusMaintenance(cmd.config.name, {
      isDisabled: true,
      reason,
    });

    await ctx.makeMessage({ content: 'comando **ADICIONADO** a manutenção.' });
  }
}
