import { Interaction, User } from 'discordeno/transformers';
import {
  ApplicationCommandOptionTypes,
  ButtonStyles,
  InteractionResponseTypes,
} from 'discordeno/types';

import blacklistRepository from '../../database/repositories/blacklistRepository';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { bot } from '../../index';
import { collectComponentInteractionWithCustomFilter } from '../../utils/discord/collectorUtils';
import {
  createActionRow,
  createButton,
  disableComponents,
} from '../../utils/discord/componentUtils';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { createCommand } from '../../structures/command/createCommand';
import { COLORS } from '../../structures/constants';
import { getAssetLink } from '../../structures/cdnManager';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { createEmbed } from '../../utils/discord/embedUtils';

const sarrada = (ctx: ChatInputInteractionContext, user: User, finishCommand: () => void): void => {
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
  finishCommand();
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

    if (user && user.id !== ctx.author.id) return sarrada(ctx, user, finishCommand);

    const selectedImage = getAssetLink('sarrar_sozinho');
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
      customId: `0|ANY|${ctx.author.id}`,
      label: ctx.locale('commands:sarrar.sarrar'),
      style: ButtonStyles.Primary,
    });

    await ctx.makeMessage({ embeds: [embed], components: [createActionRow([button])] });

    const filter = async (int: Interaction): Promise<boolean> => {
      if (int.data?.customId !== `${ctx.interaction.id}`) return false;

      if (int.user.toggles.bot || int.user.id === ctx.author.id) {
        bot.helpers.sendInteractionResponse(int.id, int.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content: ctx.prettyResponse('error', 'commands:sarrar.cannot-sarrar-self'),
            flags: MessageFlags.EPHEMERAL,
          },
        });
        return false;
      }

      bot.helpers.sendInteractionResponse(int.id, int.token, {
        type: InteractionResponseTypes.DeferredUpdateMessage,
      });

      const banned = await blacklistRepository.isUserBanned(int.user.id);

      return !banned;
    };

    const collected = await collectComponentInteractionWithCustomFilter(
      ctx.channelId,
      filter,
      30_000,
    );

    if (!collected) {
      ctx.makeMessage({
        embeds: [embed],
        components: [createActionRow(disableComponents(ctx.locale('common:timesup'), [button]))],
      });
      finishCommand();
      return;
    }

    sarrada(ctx, collected.user, finishCommand);
  },
  commandRelatedExecutions: [],
});

export default SarrarCommand;
