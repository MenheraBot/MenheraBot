import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { updateCommandMaintenanteStatus } from '../../utils/apiRequests/commands';
import commandRepository from '../../database/repositories/commandRepository';

import { bot } from '../../index';
import { createCommand } from '../../structures/command/createCommand';

const MaintenanceCommand = createCommand({
  path: '',
  name: 'manutencao',
  description: '[DEV] Manipula o estado de manutenção dos comandos',
  options: [
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'comando',
      description: 'Comando pra mete em maintenance',
      required: true,
    },
    {
      name: 'motivo',
      description: 'Motivo da manutencao',
      type: ApplicationCommandOptionTypes.String,
      required: false,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx) => {
    const cmd = bot.commands.get(ctx.getOption('comando', false, true));

    if (!cmd) return ctx.makeMessage({ content: 'Esse comando não existe' });

    const commandMaintenance = await commandRepository.getMaintenanceInfo(cmd.name);

    if (!commandMaintenance) return ctx.makeMessage({ content: 'Esse comando não está na db' });

    const reason = ctx.getOption<string>('motivo', false) ?? 'No Given Reason';

    await commandRepository.setMaintenanceInfo(
      cmd.name,
      !commandMaintenance.maintenance,
      commandMaintenance.maintenance ? '' : reason,
    );

    await updateCommandMaintenanteStatus(cmd.name, {
      isDisabled: !commandMaintenance.maintenance,
      reason: commandMaintenance.maintenance ? null : reason,
    });

    await ctx.makeMessage({
      content: `Atualiazdo o status de manutenção do comando ${
        cmd.name
      }\n\n**Novo Status:** ${!commandMaintenance.maintenance}\n**Motivo:** ${reason}`,
    });
  },
});

export default MaintenanceCommand;
