import { ApplicationCommandOptionTypes, CreateApplicationCommand } from '@discordeno/bot';
import { MessageFlags } from '@discordeno/bot';
import commandRepository from '../../database/repositories/commandRepository.js';

import { bot } from '../../index.js';
import { createCommand } from '../../structures/command/createCommand.js';

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
    if (selectedOption === 'global') {
      if (!ctx.getOption('senha', false) || ctx.getOption('senha', false) !== 'UwU') {
        ctx.makeMessage({
          content: 'SENHA ERRADA ANIMAL. CASO QUERIA DAR DEPLOY GLOBAL, A SENHA É "UwU"',
          flags: MessageFlags.Ephemeral,
        });
        return finishCommand();
      }

      const allCommands = bot.commands.reduce<CreateApplicationCommand[]>((p, c) => {
        if (c.devsOnly) return p;

        p.push({
          name: c.name,
          description: c.description,
          options: c.options,
          nameLocalizations: c.nameLocalizations,
          descriptionLocalizations: c.descriptionLocalizations,
          dmPermission: false,
        });
        return p;
      }, []);

      await ctx.makeMessage({ content: 'Iniciando deploy' });

      const updatedCommands = await bot.helpers.upsertGlobalApplicationCommands(allCommands);

      await commandRepository.bulkUpdateCommandsIds(
        updatedCommands.map((a) => ({
          commandName: a.name,
          commandId: `${a.id}`,
        })),
      );

      ctx.makeMessage({
        content: 'Todos comandos foram settados! Temos até 1 hora para tudo atualizar',
      });

      return finishCommand();
    }

    if (selectedOption === 'developer') {
      const allCommands = bot.commands.reduce<CreateApplicationCommand[]>((p, c) => {
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

    const allCommands = bot.commands.reduce<CreateApplicationCommand[]>((p, c) => {
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

    await commandRepository.bulkUpdateCommandsIds(
      res.map((a) => ({
        commandName: a.name,
        commandId: `${a.id}`,
      })),
    );

    ctx.makeMessage({
      content: `Comandos atualizados!`,
    });
    finishCommand();
  },
});

export default DeployCommand;
