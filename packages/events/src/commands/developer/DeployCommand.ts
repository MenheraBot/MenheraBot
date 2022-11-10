import { ApplicationCommandOptionTypes, CreateSlashApplicationCommand } from 'discordeno/types';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { postCommandsInformation } from '../../utils/apiRequests/commands';
import commandRepository from '../../database/repositories/commandRepository';

import { bot } from '../../index';
import { createCommand } from '../../structures/command/createCommand';
import { ApiCommandInformation } from '../../types/commands';

const DeployCommand = createCommand({
  path: '',
  name: 'deploy',
  description: '[DEV] Faz o deploy dos comandos em Slash',
  options: [
    {
      type: ApplicationCommandOptionTypes.String,
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
          name: 'DEVELOPER',
          value: 'developer',
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
      type: ApplicationCommandOptionTypes.String,
      required: false,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const selectedOption = ctx.getOption<string>('option', false, true);

    if (selectedOption === 'site') {
      const toAPIData = new Map<string, ApiCommandInformation>();
      const disabledCommands = await commandRepository.getAllCommandsInMaintenance();
      bot.commands.forEach((c) => {
        if (c.category === 'dev') return;
        const found = disabledCommands.find((a) => a._id?.toString() === c.name);

        toAPIData.set(c.name, {
          name: c.name,
          category: c.category,
          description: c.description,
          options: c.options ?? [],
          descriptionLocalizations: c.descriptionLocalizations,
          nameLocalizations: c.nameLocalizations,
          disabled: {
            isDisabled: found?.maintenance ?? false,
            reason: found?.maintenanceReason ?? null,
          },
        });
      });

      await postCommandsInformation(Array.from(toAPIData.values()));
      ctx.makeMessage({ content: 'As informaçoes dos comandos foram atualizadas na API' });
      return finishCommand();
    }

    if (selectedOption === 'global') {
      if (!ctx.getOption('senha', false) || ctx.getOption('senha', false) !== 'UwU') {
        ctx.makeMessage({
          content: 'SENHA ERRADA ANIMAL. CASO QUERIA DAR DEPLOY GLOBAL, A SENHA É "UwU"',
          flags: MessageFlags.EPHEMERAL,
        });
        return finishCommand();
      }

      const allCommands = bot.commands.reduce<CreateSlashApplicationCommand[]>((p, c) => {
        if (c.devsOnly) return p;

        p.push({
          name: c.name,
          description: c.description,
          options: c.options,
          nameLocalizations: c.nameLocalizations,
          descriptionLocalizations: c.descriptionLocalizations,
        });
        return p;
      }, []);

      await ctx.makeMessage({ content: 'Iniciando deploy' });

      await bot.helpers.upsertGlobalApplicationCommands(allCommands);

      ctx.makeMessage({
        content: 'Todos comandos foram settados! Temos até 1 hora para tudo atualizar',
      });
      return finishCommand();
    }

    if (selectedOption === 'developer') {
      const allCommands = bot.commands.reduce<CreateSlashApplicationCommand[]>((p, c) => {
        if (!c.devsOnly) return p;
        p.push({
          name: c.name,
          description: c.description,
          options: c.options,
          nameLocalizations: c.nameLocalizations,
          descriptionLocalizations: c.descriptionLocalizations,
        });
        return p;
      }, []);

      await ctx.makeMessage({ content: 'Iniciando deploy' });
      await bot.helpers.upsertGuildApplicationCommands(ctx.interaction.guildId ?? '', allCommands);

      ctx.makeMessage({ content: 'Comandos deployados no servidor' });
      return finishCommand();
    }

    const allCommands = bot.commands.reduce<CreateSlashApplicationCommand[]>((p, c) => {
      p.push({
        name: c.name,
        description: c.description,
        options: c.options,
        nameLocalizations: c.nameLocalizations,
        descriptionLocalizations: c.descriptionLocalizations,
      });
      return p;
    }, []);

    await ctx.makeMessage({ content: 'Iniciando deploy' });
    const res = await bot.helpers.upsertGuildApplicationCommands(
      ctx.interaction.guildId ?? '',
      allCommands,
    );

    ctx.makeMessage({
      content: `No total, ${res?.size} comandos foram adicionados neste servidor!`,
    });
    finishCommand();
  },
});

export default DeployCommand;
