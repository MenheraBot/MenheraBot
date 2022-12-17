import { Embed, User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes, ButtonStyles, DiscordEmbedField } from 'discordeno/types';
import { TFunction } from 'i18next';

import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { ApiGamblingGameCompatible, ApiGamblingGameStats } from '../../types/api';
import { getGamblingGameStats, getUserHuntStats } from '../../utils/apiRequests/statistics';
import { COLORS, EMOJIS } from '../../structures/constants';
import themeCreditsRepository from '../../database/repositories/themeCreditsRepository';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { getThemeById } from '../../modules/themes/getThemes';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { getUserAvatar } from '../../utils/discord/userUtils';
import { millisToSeconds } from '../../utils/miscUtils';

import { createCommand } from '../../structures/command/createCommand';

const executeHuntStats = async (ctx: ChatInputInteractionContext, finishCommand: () => void) => {
  const user = ctx.getOption<User>('user', 'users') ?? ctx.author;

  const huntData = await getUserHuntStats(user.id);

  if (huntData.error) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:status.coinflip.error'),
    });

    return finishCommand();
  }

  if (!huntData.user_id) {
    await ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:status.hunt.no-data'),
      flags: MessageFlags.EPHEMERAL,
    });

    return finishCommand();
  }

  const calculateSuccess = (successes: number, tries: number): string =>
    successes === 0 ? '0' : ((successes / tries) * 100).toFixed(1).replace('.0', '');

  const embed = createEmbed({
    title: ctx.locale('commands:status.hunt.embed-title', {
      user: `${user.username}#${user.discriminator}`,
    }),
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: [
      {
        name: `${EMOJIS.demons} | ${ctx.locale('commands:status.hunt.demon')}`,
        value: `${ctx.locale('commands:status.hunt.display-data', {
          tries: huntData.demon_tries,
          success: calculateSuccess(huntData.demon_success, huntData.demon_tries),
          hunted: huntData.demon_hunted,
        })}`,
        inline: true,
      },
      {
        name: `${EMOJIS.giants} | ${ctx.locale('commands:status.hunt.giant')}`,
        value: `${ctx.locale('commands:status.hunt.display-data', {
          tries: huntData.giant_tries,
          success: calculateSuccess(huntData.giant_success, huntData.giant_tries),
          hunted: huntData.giant_hunted,
        })}`,
        inline: true,
      },
      {
        name: `${EMOJIS.angels} | ${ctx.locale('commands:status.hunt.angel')}`,
        value: `${ctx.locale('commands:status.hunt.display-data', {
          tries: huntData.angel_tries,
          success: calculateSuccess(huntData.angel_success, huntData.angel_tries),
          hunted: huntData.angel_hunted,
        })}`,
        inline: true,
      },
      {
        name: `${EMOJIS.archangels} | ${ctx.locale('commands:status.hunt.archangel')}`,
        value: `${ctx.locale('commands:status.hunt.display-data', {
          tries: huntData.archangel_tries,
          success: calculateSuccess(huntData.archangel_success, huntData.archangel_tries),
          hunted: huntData.archangel_hunted,
        })}`,
        inline: true,
      },
      {
        name: `${EMOJIS.demigods} | ${ctx.locale('commands:status.hunt.demigod')}`,
        value: `${ctx.locale('commands:status.hunt.display-data', {
          tries: huntData.demigod_tries,
          success: calculateSuccess(huntData.demigod_success, huntData.demigod_tries),
          hunted: huntData.demigod_hunted,
        })}`,
        inline: true,
      },
      {
        name: `${EMOJIS.gods} | ${ctx.locale('commands:status.hunt.god')}`,
        value: `${ctx.locale('commands:status.hunt.display-data', {
          tries: huntData.god_tries,
          success: calculateSuccess(huntData.god_success, huntData.god_tries),
          hunted: huntData.god_hunted,
        })}`,
        inline: true,
      },
    ],
  });

  ctx.makeMessage({ embeds: [embed] });
  finishCommand();
};

const executeNotifyDesignerButton = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [notifyPurchase] = ctx.sentData;

  await userThemesRepository.makeNotify(ctx.user.id, notifyPurchase === 'true');

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: ctx.prettyResponse('success', 'commands:status.designer.success'),
  });
};

const executeDesignerStats = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  const user = ctx.getOption<User>('designer', 'users') ?? ctx.author;

  const userDesigns = await themeCreditsRepository.getDesignerThemes(user.id);

  if (userDesigns.length === 0) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:status.designer.no-designer'),
      flags: MessageFlags.EPHEMERAL,
    });

    return finishCommand();
  }

  const embed = createEmbed({
    title: ctx.locale('commands:status.designer.title', {
      user: `${user.username}#${user.discriminator}`,
    }),
    color: hexStringToNumber(ctx.authorData.selectedColor),
    thumbnail: { url: getUserAvatar(user, { enableGif: true }) },
    fields: userDesigns.reduce<DiscordEmbedField[]>((fields, design) => {
      const theme = getThemeById(design.themeId);
      const fieldName = ctx.locale(`data:themes.${design.themeId as 1}.name`);
      const fieldDescription = ctx.locale('commands:status.designer.description', {
        sold: design.timesSold,
        profit: design.totalEarned,
        registered: `<t:${millisToSeconds(design.registeredAt)}:d>`,
        royalty: design.royalty,
        type: theme.data.type,
      });

      fields.push({ name: fieldName, value: fieldDescription, inline: true });
      return fields;
    }, []),
  });

  if (ctx.author.id !== user.id) {
    ctx.makeMessage({ embeds: [embed] });

    return finishCommand();
  }

  const { notifyPurchase } = await userThemesRepository.findEnsuredUserThemes(user.id);

  embed.footer = { text: ctx.locale('commands:status.designer.notify-footer') };

  const notifyButton = createButton({
    customId: createCustomId(0, ctx.author.id, ctx.commandId, !notifyPurchase),
    emoji: { name: 'notify', id: 759607330597502976n },
    style: notifyPurchase ? ButtonStyles.Primary : ButtonStyles.Secondary,
    label: ctx.locale(`commands:status.designer.${notifyPurchase ? 'notify' : 'dont-notify'}`),
  });

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([notifyButton])] });
};

const makeGamblingStatisticsEmbed = (
  data: ApiGamblingGameStats,
  translate: TFunction,
  type: string,
  userTag: string,
): Embed => {
  const totalMoney = data.winMoney - data.lostMoney;

  const embed = createEmbed({
    title: translate(`commands:status.${type as 'coinflip'}.embed-title`, { user: userTag }),
    color: COLORS.Pinkie,
    footer: { text: translate('commands:status.coinflip.embed-footer') },
    fields: [
      {
        name: `🎰 | ${translate('commands:status.coinflip.played')}`,
        value: `**${data.playedGames}**`,
        inline: true,
      },
      {
        name: `🏆 | ${translate('commands:status.coinflip.wins')}`,
        value: `**${data.winGames}** | (${data.winPorcentage}) **%**`,
        inline: true,
      },
      {
        name: `🦧 | ${translate('commands:status.coinflip.loses')}`,
        value: `**${data.lostGames}** | (${data.lostPorcentage}) **%**`,
        inline: true,
      },
      {
        name: `📥 | ${translate('commands:status.coinflip.earnMoney')}`,
        value: `**${data.winMoney}** :star:`,
        inline: true,
      },
      {
        name: `📤 | ${translate('commands:status.coinflip.lostMoney')}`,
        value: `**${data.lostMoney}** :star:`,
        inline: true,
      },
    ],
  });

  if (totalMoney > 0)
    embed.fields?.push({
      name: `${EMOJIS.yes} | ${translate('commands:status.coinflip.profit')}`,
      value: `**${totalMoney}** :star:`,
      inline: true,
    });
  else
    embed.fields?.push({
      name: `${EMOJIS.no} | ${translate('commands:status.coinflip.loss')}`,
      value: `**${totalMoney}** :star:`,
      inline: true,
    });

  return embed;
};

const executeGamblingGameStats = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
  game: ApiGamblingGameCompatible,
) => {
  const user = ctx.getOption<User>('user', 'users') ?? ctx.author;

  const data = await getGamblingGameStats(user.id, game);

  if (data.error) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:status.coinflip.error') });

    return finishCommand();
  }

  if (!data.playedGames) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', `commands:status.${game}.no-data`) });

    return finishCommand();
  }

  const embed = makeGamblingStatisticsEmbed(
    data,
    ctx.i18n,
    game,
    `${user.username}#${user.discriminator}`,
  );

  ctx.makeMessage({ embeds: [embed] });
  finishCommand();
};

const StatsCommand = createCommand({
  path: '',
  name: 'estatísticas',
  nameLocalizations: { 'en-US': 'statistics' },
  description: '「📊」・Veja as estatísticas de algo',
  descriptionLocalizations: { 'en-US': '「📊」・See the statistics of something' },
  options: [
    {
      name: 'blackjack',
      type: ApplicationCommandOptionTypes.SubCommand,
      description: '「🃏」・Veja os status do blackjack de alguém',
      descriptionLocalizations: { 'en-US': "「🃏」・View someone's blackjack stats" },
      options: [
        {
          name: 'user',
          description: 'Usuário para ver as estatísticas',
          descriptionLocalizations: { 'en-US': 'User to see statistics' },
          type: ApplicationCommandOptionTypes.User,
          required: false,
        },
      ],
    },
    {
      name: 'bicho',
      nameLocalizations: { 'en-US': 'animal' },
      type: ApplicationCommandOptionTypes.SubCommand,
      description: '「🦌」・Veja os status do jogo do bicho de alguém',
      descriptionLocalizations: { 'en-US': "「🦌」・View someone's Animal Game stats" },
      options: [
        {
          name: 'user',
          description: 'Usuário para ver as estatísticas',
          descriptionLocalizations: { 'en-US': 'User to see statistics' },
          type: ApplicationCommandOptionTypes.User,
          required: false,
        },
      ],
    },
    {
      name: 'roleta',
      nameLocalizations: { 'en-US': 'roulette' },
      type: ApplicationCommandOptionTypes.SubCommand,
      description: '「🎡」・Veja os status de roleta de alguém',
      descriptionLocalizations: { 'en-US': "「🎡」・View someone's roulette stats" },
      options: [
        {
          name: 'user',
          description: 'Usuário para ver as estatísticas',
          descriptionLocalizations: { 'en-US': 'User to see statistics' },
          type: ApplicationCommandOptionTypes.User,
          required: false,
        },
      ],
    },
    {
      name: 'coinflip',
      description: '「📀」・Veja os status de coinflip de alguém',
      descriptionLocalizations: { 'en-US': "「📀」・View someone's coinflip stats" },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'user',
          description: 'Usuário para ver as estatísticas',
          descriptionLocalizations: { 'en-US': 'User to see statistics' },
          type: ApplicationCommandOptionTypes.User,
          required: false,
        },
      ],
    },
    {
      name: 'caçar',
      nameLocalizations: { 'en-US': 'hunt' },
      description: '「🏹」・Veja os status de caças de alguém',
      descriptionLocalizations: { 'en-US': "「🏹」・See someone's fighter stats" },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'user',
          description: 'Usuário para ver as estatísticas',
          descriptionLocalizations: { 'en-US': 'User to see statistics' },
          type: ApplicationCommandOptionTypes.User,
          required: false,
        },
      ],
    },
    {
      name: 'designer',
      description: '「🖌️」・Veja os status de design de algum designer',
      descriptionLocalizations: { 'en-US': "「🖌️」・See some designer's design stats" },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'designer',
          description: 'Designer que quer ver as informações',
          descriptionLocalizations: { 'en-US': 'Designer who wants to see the information' },
          type: ApplicationCommandOptionTypes.User,
          required: false,
        },
      ],
    },
  ],
  category: 'info',
  authorDataFields: ['selectedColor'],
  commandRelatedExecutions: [executeNotifyDesignerButton],
  execute: async (ctx, finishCommand) => {
    const subCommand = ctx.getSubCommand();

    switch (subCommand) {
      case 'designer':
        return executeDesignerStats(ctx, finishCommand);
      case 'caçar':
        return executeHuntStats(ctx, finishCommand);
      case 'roleta':
        return executeGamblingGameStats(ctx, finishCommand, 'roulette');
      case 'coinflip':
      case 'blackjack':
      case 'bicho':
        return executeGamblingGameStats(ctx, finishCommand, subCommand);
    }
  },
});

export default StatsCommand;
