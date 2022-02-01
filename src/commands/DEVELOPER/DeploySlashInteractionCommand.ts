import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { ApplicationCommandData } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { ICommandsData } from '@utils/Types';

export default class DeploySlashInteractionCommand extends InteractionCommand {
  constructor() {
    super({
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
              name: 'WEBSITE',
              value: 'site',
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
      cooldown: 1,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.options.getString('option', true) === 'site') {
      const toAPIData = new Map<string, ICommandsData>();

      const disabledCommands =
        await ctx.client.repositories.cmdRepository.getAllCommandsInMaintenance();

      await Promise.all(
        ctx.client.slashCommands.map(async (c) => {
          if (c.config.category === 'dev') return;
          const found = disabledCommands.find((a) => a._id?.toString() === c.config.name);

          toAPIData.set(c.config.name, {
            name: c.config.name,
            category: c.config.category,
            cooldown: c.config.cooldown ?? 0,
            description: c.config.description,
            options: c.config.options ?? [],
            disabled: {
              isDisabled: found?.maintenance ?? false,
              reason: found?.maintenanceReason ?? null,
            },
          });
        }),
      );

      await HttpRequests.postCommandStatus(Array.from(toAPIData.values()));
      ctx.makeMessage({ content: 'Commandos deployados' });
      return;
    }

    if (ctx.options.getString('option', true) === 'global') {
      if (!ctx.options.getString('senha') || ctx.options.getString('senha') !== 'MACACO PREGO') {
        ctx.makeMessage({
          content: 'SENHA ERRADA ANIMAL. CASO QUERIA DAR DEPLOY GLOBAL, A SENHA É "MACACO PREGO"',
          ephemeral: true,
        });
        return;
      }

      const toAPIData = new Map();

      const allCommands = ctx.client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
        if (c.config.devsOnly) return p;
        toAPIData.set(c.config.name, {
          name: c.config.name,
          category: c.config.category,
          cooldown: c.config.cooldown ?? 0,
          description: c.config.description,
          options: c.config.options ?? [],
        });
        p.push({
          name: c.config.name,
          description: c.config.description,
          options: c.config.options,
          defaultPermission: c.config.defaultPermission,
        });
        return p;
      }, []);
      await ctx.makeMessage({ content: 'Iniciando deploy' });

      const disabledCommands =
        await ctx.client.repositories.cmdRepository.getAllCommandsInMaintenance();

      disabledCommands.map((a) => {
        const data = toAPIData.get(a._id);
        data.disabled = {
          isDisabled: a._id,
          reason: a.maintenanceReason,
        };
        toAPIData.set(a._id, data);
        return a;
      });

      await HttpRequests.postCommandStatus(Array.from(toAPIData.values()));

      await ctx.client.application?.commands.set(allCommands);
      ctx.makeMessage({
        content: 'Todos comandos foram settados! Temos até 1 hora para tudo atualizar',
      });
      return;
    }

    if (ctx.options.getString('option', true) === 'developer') {
      const permissionSet: string[] = [];

      const allCommands = ctx.client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
        if (!c.config.devsOnly) return p;
        permissionSet.push(c.config.name);
        p.push({
          name: c.config.name,
          description: c.config.description,
          options: c.config.options,
          defaultPermission: c.config.defaultPermission,
        });
        return p;
      }, []);

      await ctx.makeMessage({ content: 'Iniciando deploy' });
      const res = await ctx.interaction.guild?.commands.set(allCommands);

      res?.forEach((a) => {
        if (permissionSet.includes(a.name)) {
          a.permissions.add({
            permissions: [{ id: ctx.author.id, permission: true, type: 'USER' }],
          });
        }
      });
      ctx.makeMessage({ content: 'Comandos deployados no servidor' });
      return;
    }

    const permissionSet: string[] = [];

    const allCommands = ctx.client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
      if (c.config.devsOnly) permissionSet.push(c.config.name);
      p.push({
        name: c.config.name,
        description: c.config.description,
        options: c.config.options,
        defaultPermission: c.config.defaultPermission,
      });
      return p;
    }, []);

    await ctx.makeMessage({ content: 'Iniciando deploy' });
    const res = await ctx.interaction.guild?.commands.set(allCommands);

    res?.forEach((a) => {
      if (permissionSet.includes(a.name)) {
        a.permissions.add({
          permissions: [{ id: ctx.author.id, permission: true, type: 'USER' }],
        });
      }
    });

    ctx.makeMessage({
      content: `No total, ${res?.size} comandos foram adicionados neste servidor!`,
    });
  }
}
