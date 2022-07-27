import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import userRepository from '../../database/repositories/userRepository';
import { mentionUser } from '../../utils/discord/userUtils';
import relationshipRepostory from '../../database/repositories/relationshipRepostory';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { createCommand } from '../../structures/command/createCommand';
import {
  createActionRow,
  createButton,
  disableComponents,
  generateCustomId,
  resolveCustomId,
} from '../../utils/discord/componentUtils';
import { collectResponseComponentInteraction } from '../../utils/discord/collectorUtils';

const DivorceCommand = createCommand({
  path: '',
  name: 'casar',
  nameLocalizations: { 'en-US': 'marry' },
  description: '「💍」・Case com o amor de sua vida',
  descriptionLocalizations: { 'en-US': '「💍」・Marry the love of your life' },
  options: [
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'user',
      description: 'O sortudo que vai casar com você',
      descriptionLocalizations: { 'en-US': 'The lucky one who will marry you' },
      required: true,
    },
  ],
  category: 'fun',
  authorDataFields: ['married'],
  execute: async (ctx) => {
    if (ctx.authorData.married)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:casar.married'),
        flags: MessageFlags.EPHEMERAL,
      });

    const mention = ctx.getOption<User>('user', 'users', true);

    if (mention.toggles.bot)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:casar.bot'),
        flags: MessageFlags.EPHEMERAL,
      });

    if (mention.id === ctx.author.id)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:casar.self-mention'),
        flags: MessageFlags.EPHEMERAL,
      });

    const mentionData = await userRepository.findUser(mention.id, ['married', 'ban']);

    console.log(mentionData);

    if (!mentionData)
      return ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'commands:casar.no-dbuser'),
        flags: MessageFlags.EPHEMERAL,
      });

    if (mentionData.ban)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:casar.banned-user'),
        flags: MessageFlags.EPHEMERAL,
      });

    if (mentionData.married)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:casar.mention-married'),
        flags: MessageFlags.EPHEMERAL,
      });

    await ctx.defer();

    const confirmButton = createButton({
      customId: generateCustomId('CONFIRM', ctx.interaction.id),
      label: ctx.locale('commands:casar.accept'),
      style: ButtonStyles.Success,
    });

    const cancelButton = createButton({
      customId: generateCustomId('CANCEL', ctx.interaction.id),
      label: ctx.locale('commands:casar.deny'),
      style: ButtonStyles.Danger,
    });

    ctx.makeMessage({ content: 'aaa' });

    await ctx.makeMessage({
      content: ctx.prettyResponse('question', 'commands:casar.first-text', {
        author: mentionUser(ctx.author.id),
        toMarry: mentionUser(mention.id),
      }),
      components: [createActionRow([confirmButton, cancelButton])],
    });

    const collected = await collectResponseComponentInteraction(
      ctx.channelId,
      mention.id,
      `${ctx.interaction.id}`,
      15_000,
    );

    if (!collected)
      return ctx.makeMessage({
        components: [
          createActionRow(
            disableComponents(ctx.locale('common:timesup'), [confirmButton, cancelButton]),
          ),
        ],
      });

    const selectedButton = resolveCustomId(collected.data?.customId as string);

    if (selectedButton === 'CANCEL')
      return ctx.makeMessage({
        components: [],
        content: ctx.prettyResponse('error', 'commands:casar.negated'),
      });

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:casar.accepted', {
        author: mentionUser(ctx.author.id),
        mention: mentionUser(mention.id),
      }),
      components: [],
    });

    await relationshipRepostory.executeMarry(ctx.author.id, mention.id);
  },
});

export default DivorceCommand;
