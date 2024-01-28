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
      required: true,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const fullCommand = ctx.getOption<string>('comando', false, true);
    const [command] = fullCommand.split(' ');

    const cmd = bot.commands.get(command);

    if (!cmd) return finishCommand(ctx.makeMessage({ content: 'Esse comando não existe' }));

    const commandMaintenance = await commandRepository.getCommandInfo(cmd.name);

    if (!commandMaintenance)
      return finishCommand(ctx.makeMessage({ content: 'Esse comando não está na db' }));

    const reason = ctx.getOption<string>('motivo', false, true);

    const currentMaintenances = Array.isArray(commandMaintenance.maintenance)
      ? commandMaintenance.maintenance
      : [];

    if (!currentMaintenances.some((a) => a.commandStructure === fullCommand))
      currentMaintenances.push({ commandStructure: fullCommand, reason });
    else
      currentMaintenances.splice(
        currentMaintenances.findIndex((b) => b.commandStructure === fullCommand),
      );

    await commandRepository.setMaintenanceInfo(cmd.name, currentMaintenances);

    await updateCommandMaintenanteStatus(cmd.name, {
      isDisabled: !commandMaintenance.maintenance,
      reason: commandMaintenance.maintenance ? null : reason,
    });

    await ctx.makeMessage({
      content: `Atualizando o status de manutenção do comando ${
        cmd.name
      }\n\n**Novo Status:** ${!commandMaintenance.maintenance}\n**Motivo:** ${reason}`,
    });

    finishCommand();
  },
});

export default MaintenanceCommand;
