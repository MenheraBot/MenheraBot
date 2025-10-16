import {
  AllowedMentionsTypes,
  ApplicationCommandOptionTypes,
  ButtonStyles,
} from 'discordeno/types';
import { User } from 'discordeno/transformers';

import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import userRepository from '../../database/repositories/userRepository.js';
import { mentionUser } from '../../utils/discord/userUtils.js';
import relationshipRepostory from '../../database/repositories/relationshipRepostory.js';
import { MessageFlags } from '../../utils/discord/messageUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';

const executeMarry = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedButton] = ctx.sentData;

  if (selectedButton === 'CANCEL')
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:casar.negated', {
        author: mentionUser(ctx.commandAuthor.id),
        toMarry: mentionUser(ctx.user.id),
      }),
      allowedMentions: { parse: [AllowedMentionsTypes.UserMentions] },
    });

  const [userData, commandAuthorData] = await Promise.all([
    userRepository.ensureFindUser(ctx.user.id),
    userRepository.ensureFindUser(ctx.commandAuthor.id),
  ]);

  if (userData.married || commandAuthorData.married)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:casar.someone-married'),
      components: [],
    });

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:casar.accepted', {
      author: mentionUser(ctx.commandAuthor.id),
      toMarry: mentionUser(ctx.user.id),
    }),
    allowedMentions: { parse: [AllowedMentionsTypes.UserMentions] },
    components: [],
  });

  await relationshipRepostory.executeMarry(ctx.commandAuthor.id, ctx.user.id);
};

const MarryCommand = createCommand({
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
  commandRelatedExecutions: [executeMarry],
  execute: async (ctx, finishCommand) => {
    if (ctx.authorData.married)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:casar.married'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const mention = ctx.getOption<User>('user', 'users', true);

    if (mention.toggles.bot)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:casar.bot'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    if (mention.id === ctx.author.id)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:casar.self-mention'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const mentionData = await userRepository.ensureFindUser(mention.id);

    if (mentionData.ban)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:casar.banned-user'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    if (mentionData.married)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:casar.mention-married'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const confirmButton = createButton({
      customId: createCustomId(0, mention.id, ctx.originalInteractionId, 'CONFIRM'),
      label: ctx.locale('commands:casar.accept'),
      style: ButtonStyles.Success,
    });

    const cancelButton = createButton({
      customId: createCustomId(0, mention.id, ctx.originalInteractionId, 'CANCEL'),
      label: ctx.locale('commands:casar.deny'),
      style: ButtonStyles.Danger,
    });

    await ctx.makeMessage({
      content: ctx.prettyResponse('question', 'commands:casar.first-text', {
        author: mentionUser(ctx.author.id),
        toMarry: mentionUser(mention.id),
      }),
      allowedMentions: { parse: [AllowedMentionsTypes.UserMentions] },
      components: [createActionRow([confirmButton, cancelButton])],
    });

    finishCommand();
  },
});

export default MarryCommand;
