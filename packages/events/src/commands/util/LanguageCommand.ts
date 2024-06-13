import { ToggleBitfieldBigint } from 'discordeno/transformers';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import guildRepository from '../../database/repositories/guildRepository';
import { EMOJIS } from '../../structures/constants';
import { SelectMenuInteraction } from '../../types/interaction';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
} from '../../utils/discord/componentUtils';
import { createCommand } from '../../structures/command/createCommand';

const changeLanguage = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const lang = ctx.interaction.data.values[0];

  await guildRepository.updateGuildLanguage(ctx.interaction.guildId as bigint, lang);

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
  commandRelatedExecutions: [changeLanguage],
  execute: async (ctx, finishCommand) => {
    if (
      !new ToggleBitfieldBigint(ctx.interaction.member?.permissions as bigint).contains(
        // eslint-disable-next-line no-bitwise
        BigInt(1 << 5),
      )
    ) {
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
