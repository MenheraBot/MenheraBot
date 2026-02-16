import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import guildRepository from '../../database/repositories/guildRepository.js';
import { EMOJIS } from '../../structures/constants.js';
import { SelectMenuInteraction } from '../../types/interaction.js';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
} from '../../utils/discord/componentUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { DiscordApplicationIntegrationType, DiscordInteractionContextType } from '@discordeno/bot';

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

const LanguageCommand = createCommand({
  path: '',
  name: 'idioma',
  nameLocalizations: { 'en-US': 'language' },
  description: '「🌐」・Mude o idioma em que eu falo neste servidor!',
  descriptionLocalizations: {
    'en-US': '「🌐」・Change the language I speak on this server!',
  },
  category: 'util',
  options: [],
  authorDataFields: [],
  contexts: [DiscordInteractionContextType.Guild],
  integrationTypes: [DiscordApplicationIntegrationType.GuildInstall],
  commandRelatedExecutions: [changeLanguage],
  execute: async (ctx, finishCommand) => {
    if (!ctx.interaction.member?.permissions?.has('MANAGE_GUILD')) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'permissions:USER_MISSING_PERMISSION', {
          perm: ctx.locale('permissions:MANAGE_GUILD'),
        }),
      });

      return finishCommand();
    }

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
  },
});

export default LanguageCommand;
