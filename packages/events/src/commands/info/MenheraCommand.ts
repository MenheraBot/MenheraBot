import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';

import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { createCommand } from '../../structures/command/createCommand';
import { bot } from '../..';
import { createEmbed } from '../../utils/discord/embedUtils';
import { createActionRow, createButton } from '../../utils/discord/componentUtils';

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

const MenheraCommand = createCommand({
  path: '',
  name: 'menhera',
  description: '「✨」・Informações referentes à Menhera',
  descriptionLocalizations: { 'en-US': '「✨」・Information regarding Menhera' },
  category: 'info',
  options: [
    /*     {
      name: 'estatísticas',
      nameLocalizations: { 'en-US': 'statistics' },
      description: '「🤖」・Veja as estatísticas atuais da Menhera',
      descriptionLocalizations: { 'en-US': "「🤖」・See Menhera's current stats" },
      type: ApplicationCommandOptionTypes.SubCommand,
    }, */
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
  ],
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const subCommand = ctx.getSubCommand();

    if (subCommand === 'suporte') return executeSupportCommand(ctx);

    if (subCommand === 'atualização') return executeChangelogCommand(ctx);

    // if (subCommand === 'estatísticas') return executeStatisticsCommand(ctx, finishCommand);
  },
});

export default MenheraCommand;
