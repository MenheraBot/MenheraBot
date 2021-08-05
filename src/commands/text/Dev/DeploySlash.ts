/* eslint-disable no-param-reassign */
import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';

import Command from '@structures/Command';
import { ApplicationCommandData } from 'discord.js';

export default class EvalCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'deploy',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    if (ctx.args[0] && ctx.args[0] === 'GLOBAL_DEPLOY') {
      const allCommands = this.client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
        p.push({
          name: c.config.name,
          description: c.config.description,
          options: c.config.options,
          defaultPermission: c.config.defaultPermission,
        });
        return p;
      }, []);
      ctx.send('Iniciando deploy');
      await this.client.application?.commands.set(allCommands);
      ctx.send('Todos comandos foram settados! Temos até 1 hora para tudo atualizar');
      return;
    }

    const allCommands = this.client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
      p.push({
        name: c.config.name,
        description: c.config.description,
        options: c.config.options,
        defaultPermission: c.config.defaultPermission,
      });
      return p;
    }, []);
    ctx.send('Iniciando deploy');
    const res = await ctx.message.guild?.commands.set(allCommands);
    ctx.send(`No total, ${res?.size} comandos foram adicionados neste servidor!`);
  }
}
