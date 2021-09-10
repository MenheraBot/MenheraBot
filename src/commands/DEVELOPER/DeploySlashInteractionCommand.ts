import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { ApplicationCommand, ApplicationCommandData } from 'discord.js';

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
            {
              name: 'DEVELOPER',
              value: 'developer',
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
        return;
      }
      const allCommands = this.client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
        if (c.config.devsOnly) return p;
        p.push({
          name: c.config.name,
          description: c.config.description,
          options: c.config.options,
          defaultPermission: c.config.defaultPermission,
        });
        this.client.repositories.commandsRepository.updateByName({
          _id: c.config.name,
          category: c.config.category,
          cooldown: c.config.cooldown ?? 3,
          description: c.config.description,
          options: c.config.options ?? [],
        });
        return p;
      }, []);
      await ctx.reply('Iniciando deploy');
      await this.client.application?.commands.set(allCommands);
      ctx.editReply({
        content: 'Todos comandos foram settados! Temos até 1 hora para tudo atualizar',
      });
      await this.client.repositories.commandsRepository.deleteOldCommands(
        allCommands.map((a) => a.name),
      );
      return;
    }

    if (ctx.options.getString('option', true) === 'developer') {
      const permissionSet: string[] = [];
      const commandCreated: ApplicationCommand[] = [];

      await ctx.reply('Iniciando deploy');

      this.client.slashCommands.map(async (p) => {
        if (!p.config.devsOnly) return;
        permissionSet.push(p.config.name);
        const res = await ctx.interaction.guild?.commands.create({
          name: p.config.name,
          description: p.config.description,
          options: p.config.options,
          defaultPermission: p.config.defaultPermission,
        });
        if (!res) return;
        commandCreated.push(res);
      });

      commandCreated.forEach((a) => {
        if (permissionSet.includes(a.name)) {
          a.permissions.add({
            permissions: [{ id: ctx.author.id, permission: true, type: 'USER' }],
          });
        }
      });
      return;
    }

    const permissionSet: string[] = [];

    const allCommands = this.client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
      if (c.config.devsOnly) permissionSet.push(c.config.name);
      p.push({
        name: c.config.name,
        description: c.config.description,
        options: c.config.options,
        defaultPermission: c.config.defaultPermission,
      });
      return p;
    }, []);

    await ctx.reply('Iniciando deploy');
    const res = await ctx.interaction.guild?.commands.set(allCommands);

    res?.forEach((a) => {
      if (permissionSet.includes(a.name)) {
        a.permissions.add({
          permissions: [{ id: ctx.author.id, permission: true, type: 'USER' }],
        });
      }
    });

    ctx.editReply({ content: `No total, ${res?.size} comandos foram adicionados neste servidor!` });
  }
}
