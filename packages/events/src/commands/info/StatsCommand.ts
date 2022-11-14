import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes, ButtonStyles, DiscordEmbedField } from 'discordeno/types';

import { getUserHuntStats } from '../../utils/apiRequests/statistics';
import { EMOJIS } from '../../structures/constants';
import themeCreditsRepository from '../../database/repositories/themeCreditsRepository';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { getThemeById } from '../../modules/themes/getThemes';
import InteractionContext from '../../structures/command/InteractionContext';
import { collectResponseComponentInteraction } from '../../utils/discord/collectorUtils';
import {
  createActionRow,
  createButton,
  disableComponents,
  generateCustomId,
} from '../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { getUserAvatar } from '../../utils/discord/userUtils';
import { millisToSeconds } from '../../utils/miscUtils';

import { createCommand } from '../../structures/command/createCommand';

const executeHuntStats = async (ctx: InteractionContext, finishCommand: () => void) => {
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

  const calculateSuccess = (sucesses: number, tries: number): string =>
    sucesses === 0 ? '0' : ((sucesses / tries) * 100).toFixed(1).replace('.0', '');

  const embed = createEmbed({
    title: ctx.locale('commands:status.hunt.embed-title', { user: user.username }),
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

const executeDesignerStats = async (
  ctx: InteractionContext,
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
        rarity: theme.data.rarity,
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
    customId: generateCustomId('NOTIFY', ctx.interaction.id),
    emoji: { name: 'notify', id: 759607330597502976n },
    style: notifyPurchase ? ButtonStyles.Primary : ButtonStyles.Secondary,
    label: ctx.locale(`commands:status.designer.${notifyPurchase ? 'notify' : 'dont-notify'}`),
  });

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([notifyButton])] });

  const selected = await collectResponseComponentInteraction(
    ctx.channelId,
    ctx.author.id,
    `${ctx.interaction.id}`,
    7_500,
  );

  if (!selected) {
    ctx.makeMessage({
      components: [
        createActionRow(disableComponents(ctx.locale('common:timesup'), [notifyButton])),
      ],
    });

    return finishCommand();
  }

  await userThemesRepository.makeNotify(ctx.author.id, !notifyPurchase);

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: ctx.prettyResponse('success', 'commands:status.designer.success'),
  });

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
  execute: async (ctx, finishCommand) => {
    const subCommand = ctx.getSubCommand();

    switch (subCommand) {
      case 'designer':
        return executeDesignerStats(ctx, finishCommand);
      case 'caçar':
        return executeHuntStats(ctx, finishCommand);
    }
  },
});

export default StatsCommand;
