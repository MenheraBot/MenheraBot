import { ApplicationCommandOptionTypes, ButtonStyles } from '@discordeno/bot';

import { MessageFlags } from '@discordeno/bot';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { COLORS } from '../../structures/constants.js';
import { getAssetLink } from '../../structures/cdnManager.js';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { User } from '../../types/discordeno.js';

const sarrada = async (ctx: ComponentInteractionContext): Promise<void> => {
  const { commandAuthor } = ctx;

  if (ctx.interaction.user.bot || commandAuthor.id === ctx.user.id) {
    await ctx.respondInteraction({
      content: ctx.prettyResponse('error', 'commands:sarrar.cannot-sarrar-self'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const selectedImage = getAssetLink('sarrar');

  const avatar = getUserAvatar(ctx.user, { enableGif: true });

  const embed = createEmbed({
    title: ctx.locale('commands:sarrar.embed_title'),
    description: ctx.locale('commands:sarrar.embed_description', {
      author: mentionUser(commandAuthor?.id ?? 0n),
      mention: mentionUser(ctx.user.id),
    }),
    image: { url: selectedImage },
    color: COLORS.ACTIONS,
    thumbnail: { url: avatar },
  });

  await ctx.makeMessage({ embeds: [embed], components: [] });
};

const SarrarCommand = createCommand({
  path: '',
  name: 'sarrar',
  nameLocalizations: { 'en-US': 'dance' },
  description: '「🔥」・Invoca o poder dos irmãos Berti para fazer a lendária sarrada',
  descriptionLocalizations: { 'en-US': '「🔥」・Dance with a friend' },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Convoque alguém para sarrar contigo',
      descriptionLocalizations: { 'en-US': 'Summon someone to dance with you' },
      required: false,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users');

    if (user && user.id !== ctx.author.id) {
      const selectedImage = getAssetLink('sarrar');

      const avatar = getUserAvatar(ctx.author, { enableGif: true });

      const embed = createEmbed({
        title: ctx.locale('commands:sarrar.embed_title'),
        description: ctx.locale('commands:sarrar.embed_description', {
          author: mentionUser(ctx.author.id),
          mention: mentionUser(user.id),
        }),
        image: { url: selectedImage },
        color: COLORS.ACTIONS,
        thumbnail: { url: avatar },
      });

      ctx.makeMessage({ embeds: [embed], components: [] });
      return finishCommand();
    }

    const selectedImage = getAssetLink('sarrar');
    const avatar = getUserAvatar(ctx.author, { enableGif: true });

    const embed = createEmbed({
      title: ctx.locale('commands:sarrar.no-mention.embed_title'),
      description: ctx.locale('commands:sarrar.no-mention.embed_description', {
        author: mentionUser(ctx.author.id),
      }),
      image: { url: selectedImage },
      color: COLORS.ACTIONS,
      thumbnail: { url: avatar },
      footer: { text: ctx.locale('commands:sarrar.no-mention.embed_footer') },
    });

    const button = createButton({
      customId: createCustomId(0, 'N', ctx.originalInteractionId),
      label: ctx.locale('commands:sarrar.sarrar'),
      style: ButtonStyles.Primary,
    });

    await ctx.makeMessage({ embeds: [embed], components: [createActionRow([button])] });
    finishCommand();
  },
  commandRelatedExecutions: [sarrada],
});

export default SarrarCommand;
