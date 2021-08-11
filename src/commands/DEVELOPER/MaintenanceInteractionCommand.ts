import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class MaintenanceSlashInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'manuntencao',
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
    const cmd = this.client.slashCommands.get(ctx.options.getString('comando', true));
    if (!cmd) {
      await ctx.replyE('error', 'este comando não existe');
      return;
    }

    const command = await this.client.repositories.cacheRepository.fetchCommand(cmd.config.name);

    if (!command) {
      await ctx.replyE('error', 'este comando não existe');
      return;
    }

    if (command.maintenance) {
      await this.client.repositories.maintenanceRepository.removeMaintenance(cmd.config.name);
      await this.client.repositories.cacheRepository.updateCommand(cmd.config.name, {
        maintenance: false,
        maintenanceReason: null,
      });
      await ctx.replyE('success', 'comando **REMOVIDO** da manutenção.');
      return;
    }
    const reason = ctx.options.getString('motivo') ?? 'Sem motivo informado';
    await this.client.repositories.maintenanceRepository.addMaintenance(cmd.config.name, reason);
    await this.client.repositories.cacheRepository.updateCommand(cmd.config.name, {
      maintenance: true,
      maintenanceReason: reason,
    });

    await ctx.replyE('success', 'comando **ADICIONADO** a manutenção.');
  }
}
