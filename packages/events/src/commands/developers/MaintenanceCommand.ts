import commandRepository from 'database/repositories/commandRepository';
import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { bot } from '../../index';
import { createCommand } from '../../structures/command/createCommand';

const BlacklistCommand = createCommand({
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

    if(commandMaintenance.maintenance) {
      await commandRepository.
    }
  },
});

export default BlacklistCommand;
