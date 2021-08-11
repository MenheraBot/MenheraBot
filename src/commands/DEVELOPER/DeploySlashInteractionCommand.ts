import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { ApplicationCommandData } from 'discord.js';

export default class DeploySlashInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'deploy',
      description: 'da deploy nos slash',
      category: 'dev',
      options: [
        {
          type: 'STRING',
          name: 'option',
          description: 'Tipo, se quer no server ou global',
          choices: [
            {
              name: 'Global',
              value: 'global',
            },
            {
              name: 'Server',
              value: 'server',
            },
          ],
          required: true,
        },
        {
          name: 'senha',
          description: 'senha pra fazer deploy global pra ter certeza que n apertei errado',
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
    if (ctx.options.getString('option', true) === 'global') {
      if (!ctx.options.getString('senha') || ctx.options.getString('senha') !== 'MACACO PREGO') {
        ctx.reply({
          content: 'SENHA ERRADA ANIMAL. CASO QUERIA DAR DEPLOY GLOBAL, A SENHA É "MACACO PREGO"',
          ephemeral: true,
        });
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
      ctx.reply('Iniciando deploy');
      await this.client.application?.commands.set(allCommands);
      ctx.editReply({
        content: 'Todos comandos foram settados! Temos até 1 hora para tudo atualizar',
      });
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
    ctx.reply('Iniciando deploy');
    const res = await ctx.interaction.guild?.commands.set(allCommands);
    ctx.editReply({ content: `No total, ${res?.size} comandos foram adicionados neste servidor!` });
  }
}
