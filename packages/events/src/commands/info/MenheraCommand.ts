import {
  ActionRow,
  ApplicationCommandOptionTypes,
  ButtonStyles,
  DiscordEmbed,
  TextStyles,
} from '@discordeno/bot';

import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { MessageFlags } from '../../utils/discord/messageUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { bot } from '../../index.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import {
  createActionRow,
  createButton,
  createCustomId,
  createTextInput,
} from '../../utils/discord/componentUtils.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { extractFields } from '../../utils/discord/modalUtils.js';
import { ModalInteraction } from '../../types/interaction.js';
import { InteractionContext } from '../../types/menhera.js';
import { getUserAvatar } from '../../utils/discord/userUtils.js';
import { getEnviroments } from '../../utils/getEnviroments.js';
import suggestionLimitRepository from '../../database/repositories/suggestionLimitRepository.js';
import { millisToSeconds } from '../../utils/miscUtils.js';

const { SUGGESTION_CHANNEL_ID } = getEnviroments(['SUGGESTION_CHANNEL_ID']);

const executeSupportCommand = async (ctx: ChatInputInteractionContext) => {
  ctx.makeMessage({
    content: ctx.prettyResponse('wink', 'commands:menhera.suporte.message'),
    flags: MessageFlags.EPHEMERAL,
  });
};

const executeChangelogCommand = async (ctx: ChatInputInteractionContext) => {
  if (!bot.changelog)
    return ctx.makeMessage({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('error', 'commands:menhera.changelog.no-changelog'),
    });

  const button = createButton({
    label: ctx.locale('commands:menhera.changelog.older-releases'),
    url: 'https://menherabot.xyz/changelog?utm_source=discord&utm_medium=button_component',
    style: ButtonStyles.Link,
  });

  const embed = createEmbed({
    title: ctx.locale('commands:menhera.changelog.title', { version: bot.changelog.versionName }),
    footer: { text: ctx.locale('commands:menhera.changelog.footer', { date: bot.changelog.date }) },
    color: 0xf37ee9,
    description: Object.entries(bot.changelog.info)
      .reduce<string>((text, [field, info]) => {
        if (typeof info !== 'string') return text;

        return `${text}### ${ctx
          .locale(`commands:menhera.changelog.${field as 'hotfix'}`)
          .toUpperCase()}\n${info}`;
      }, '')
      .substring(0, 4096),
  });

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([button])] });
};

const suggestionEmbedAndButton = (
  ctx: InteractionContext,
  suggestion: string,
  embedColor: string,
): [DiscordEmbed, ActionRow] => [
  createEmbed({
    title: ctx.locale('commands:menhera.suggest.confirm-title'),
    footer: { text: ctx.locale('commands:menhera.suggest.footer') },
    description: suggestion,
    color: hexStringToNumber(embedColor),
    thumbnail: { url: getUserAvatar(ctx.user, { enableGif: true }) },
  }),
  createActionRow([
    createButton({
      label: ctx.locale('commands:menhera.suggest.edit'),
      style: ButtonStyles.Secondary,
      customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'EDIT', embedColor),
    }),
    createButton({
      label: ctx.locale('commands:menhera.suggest.confirm'),
      style: ButtonStyles.Primary,
      customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'CONFIRM', embedColor),
    }),
  ]),
];

const handleSuggestionInteraction = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
): Promise<void> => {
  const [option, embedColor] = ctx.sentData;

  if (option === 'CONFIRM') {
    const suggestion = ctx.interaction.message?.embeds?.[0].description;

    if (!suggestion) return ctx.ack();

    bot.helpers.sendMessage(BigInt(SUGGESTION_CHANNEL_ID), {
      content: `${ctx.user.id} ${ctx.user.username}\n\n${suggestion}`,
    });

    return ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('wink', 'commands:menhera.suggest.thanks'),
    });
  }

  if (option === 'EDIT') {
    const suggestion = ctx.interaction.message?.embeds?.[0].description;

    if (!suggestion) return ctx.ack();

    return ctx.respondWithModal({
      title: ctx.locale('commands:menhera.suggest.edit-title'),
      customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'MODAL', embedColor),
      components: [
        createActionRow([
          createTextInput({
            customId: 'SUGGESTION',
            label: ctx.locale('commands:menhera.suggest.edit-title'),
            style: TextStyles.Paragraph,
            minLength: 10,
            maxLength: 3900,
            required: true,
            value: suggestion,
            placeholder: suggestion,
          }),
        ]),
      ],
    });
  }

  if (option === 'MODAL') {
    const suggestion = extractFields(ctx.interaction)[0].value;

    const [embed, buttons] = suggestionEmbedAndButton(ctx, suggestion, embedColor);

    return ctx.makeMessage({
      embeds: [embed],
      components: [buttons],
      flags: MessageFlags.EPHEMERAL,
    });
  }
};

const executeSuggestCommand = async (ctx: ChatInputInteractionContext): Promise<void> => {
  const suggestion = ctx.getOption<string>('sugestão', false, true);

  const isUserLimited = await suggestionLimitRepository.getLimitData(ctx.user.id);

  if (isUserLimited && isUserLimited.limited)
    return ctx.makeMessage({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('error', 'commands:menhera.suggest.limited', {
        unix: millisToSeconds(isUserLimited.limitedAt),
      }),
    });

  const [embed, buttons] = suggestionEmbedAndButton(ctx, suggestion, ctx.authorData.selectedColor);

  ctx.makeMessage({
    embeds: [embed],
    components: [buttons],
    flags: MessageFlags.EPHEMERAL,
  });
};

const MenheraCommand = createCommand({
  path: '',
  name: 'menhera',
  description: '「✨」・Informações referentes à Menhera',
  descriptionLocalizations: { 'en-US': '「✨」・Information regarding Menhera' },
  category: 'info',
  options: [
    {
      name: 'suporte',
      nameLocalizations: { 'en-US': 'support' },
      description: '「💌」・Está com problemas? Entre em meu servidor de suporte!',
      descriptionLocalizations: { 'en-US': '「💌」・Have any problems? Join my support server!' },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'atualização',
      nameLocalizations: { 'en-US': 'update' },
      description: '「✨」・Veja as informações da última atualização da Menhera',
      descriptionLocalizations: { 'en-US': "「✨」・See information from Menhera's latest update" },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'sugerir',
      nameLocalizations: { 'en-US': 'suggest' },
      description: '「🌺」・Alguma ideia extraordinária? Envie uma sugestão!',
      descriptionLocalizations: { 'en-US': '「🌺」・Any extraordinary ideas? Send a suggestion!' },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          type: ApplicationCommandOptionTypes.String,
          name: 'sugestão',
          nameLocalizations: { 'en-US': 'suggestion' },
          description: 'Descreva com os maiores detalhes a sua ideia',
          descriptionLocalizations: { 'en-US': 'Describe your idea in as much detail as possible' },
          minLength: 10,
          maxLength: 3900,
          required: true,
        },
      ],
    },
  ],
  authorDataFields: ['selectedColor'],
  commandRelatedExecutions: [handleSuggestionInteraction],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const subCommand = ctx.getSubCommand();

    if (subCommand === 'suporte') return executeSupportCommand(ctx);

    if (subCommand === 'atualização') return executeChangelogCommand(ctx);

    if (subCommand === 'sugerir') return executeSuggestCommand(ctx);
  },
});

export default MenheraCommand;
