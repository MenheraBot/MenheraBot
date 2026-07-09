import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import guildRepository from '../../database/repositories/guildRepository.js';
import { EMOJIS } from '../../structures/constants.js';
import { SelectMenuInteraction } from '../../types/interaction.js';
import {
  createActionRow,
  createContainer,
  createCustomId,
  createSelectMenu,
  createSeparator,
  createTextDisplay,
} from '../../utils/discord/componentUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import {
  ApplicationCommandOptionTypes,
  DiscordApplicationIntegrationType,
  DiscordInteractionContextType,
  SelectOption,
} from '@discordeno/bot';
import { InteractionContext } from '../../types/menhera.js';
import { getFullComandNames } from '../../modules/top/commandIdAutocompleteInteraction.js';

const changeLanguage = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const lang = ctx.interaction.data.values[0];

  if (!ctx.interaction.guildId) throw new Error(`Guild ID does not exists!`);

  await guildRepository.updateGuildLanguage(ctx.interaction.guildId, lang);

  ctx.makeMessage({
    components: [],
    content: ctx.prettyResponse(
      'success',
      `commands:idioma.${lang.split('-')[0] as 'pt'}-response`,
    ),
  });
};

const displayDisabledCommands = (ctx: InteractionContext, disabledCommands: string[]) => {
  if (disabledCommands.length === 0)
    return ctx.makeLayoutMessage({
      components: [
        createTextDisplay(ctx.prettyResponse('no', 'commands:desabilitar_comando.no-disabled')),
      ],
    });

  const selectRenable = createSelectMenu({
    customId: createCustomId(1, ctx.user.id, ctx.originalInteractionId),
    placeholder: ctx.locale('commands:desabilitar_comando.select-disabled'),
    minValues: 1,
    options: disabledCommands.reduce<SelectOption[]>((p, c) => {
      if (p.length >= 25) return p;

      if (p.some((v) => v.value === c)) return p;

      p.push({ label: `/${c}`, value: c });

      return p;
    }, []),
  });

  selectRenable.maxValues = selectRenable.options.length;

  return ctx.makeLayoutMessage({
    components: [
      createContainer({
        components: [
          createTextDisplay(
            `## ${ctx.locale('commands:desabilitar_comando.disabled-commands')}\n\n- ${disabledCommands.join('\n- ')}`,
          ),
          createSeparator(),
          createActionRow([selectRenable]),
        ],
      }),
    ],
  });
};

const enableCommands = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  if (!ctx.interaction.guildId) return;

  const guildInfo = await guildRepository.getGuildInfo(ctx.interaction.guildId);

  const newCommands = guildInfo.disabledCommands.filter(
    (c) => !ctx.interaction.data.values.includes(c),
  );

  await guildRepository.updateDisabledCommands(ctx.interaction.guildId, newCommands);

  return displayDisabledCommands(ctx, newCommands);
};

const SettingsCommand = createCommand({
  path: '',
  name: 'configurar',
  nameLocalizations: { 'en-US': 'settings' },
  description: '「🔧」・Mude as configurações da Menhera!',
  descriptionLocalizations: {
    'en-US': "「🔧」・Change Menhera's settings in this server!",
  },
  category: 'util',
  options: [
    {
      name: 'idioma',
      nameLocalizations: { 'en-US': 'language' },
      description: '「🌐」・Mude o idioma que falo neste servidor!',
      descriptionLocalizations: {
        'en-US': "「🌐」・Change Menhera's settings in this server!",
      },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'desabilitar_comando',
      nameLocalizations: { 'en-US': 'disable_command' },
      description: '「🚫」・Desabilite comandos da Menhera neste servidor!',
      descriptionLocalizations: {
        'en-US': "「🚫」・Disable Menhera's commands in this server!",
      },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'comando',
          description: 'Comando para desabilitar. Ex.: menhera sugerir',
          nameLocalizations: {
            'en-US': 'command',
          },
          descriptionLocalizations: { 'en-US': 'Command to disable. Ex.: menhera suggest' },
          type: ApplicationCommandOptionTypes.String,
          autocomplete: true,
        },
      ],
    },
  ],
  authorDataFields: [],
  contexts: [DiscordInteractionContextType.Guild],
  integrationTypes: [DiscordApplicationIntegrationType.GuildInstall],
  defaultMemberPermissions: ['MANAGE_GUILD'],
  commandRelatedExecutions: [changeLanguage, enableCommands],
  execute: async (ctx, finishCommand) => {
    if (!ctx.interaction.guildId || !ctx.interaction.member?.permissions?.has('MANAGE_GUILD')) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'permissions:USER_MISSING_PERMISSION', {
          perm: ctx.locale('permissions:MANAGE_GUILD'),
        }),
      });

      return finishCommand();
    }

    const subCommand = ctx.getSubCommand();

    if (subCommand === 'idioma') {
      const selector = createSelectMenu({
        customId: createCustomId(0, ctx.author.id, ctx.originalInteractionId, 'LANGUAGE'),
        minValues: 1,
        maxValues: 1,
        placeholder: ctx.locale('commands:idioma.select'),
        options: [
          {
            label: ctx.locale('common:english'),
            description: ctx.locale('commands:idioma.english'),
            value: 'en-US',
            emoji: { name: EMOJIS.us },
          },
          {
            label: ctx.locale('common:portuguese'),
            description: ctx.locale('commands:idioma.portuguese'),
            value: 'pt-BR',
            emoji: { name: EMOJIS.br },
          },
        ],
      });

      ctx.makeMessage({
        content: ctx.prettyResponse('question', 'commands:idioma.question'),
        components: [createActionRow([selector])],
      });

      finishCommand();
    }

    const guildInfo = await guildRepository.getGuildInfo(ctx.interaction.guildId);

    const option = ctx.getOption<string>('comando', false);

    if (!option) return displayDisabledCommands(ctx, guildInfo.disabledCommands);

    const fullCommands = getFullComandNames();

    if (!fullCommands.some((c) => c.value === option))
      return ctx.makeLayoutMessage({
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:desabilitar_comando.unknown-command'),
          ),
        ],
      });

    if (guildInfo.disabledCommands.includes(option)) {
      await guildRepository.updateDisabledCommands(
        ctx.interaction.guildId,
        guildInfo.disabledCommands.filter((c) => c !== option),
      );

      return ctx.makeLayoutMessage({
        components: [
          createTextDisplay(
            ctx.prettyResponse('success', 'commands:desabilitar_comando.enabled_success'),
          ),
        ],
      });
    }

    await guildRepository.updateDisabledCommands(ctx.interaction.guildId, [
      ...guildInfo.disabledCommands,
      option,
    ]);

    return ctx.makeLayoutMessage({
      components: [
        createTextDisplay(ctx.prettyResponse('success', 'commands:desabilitar_comando.success')),
      ],
    });
  },
});

export default SettingsCommand;
