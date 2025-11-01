import { ButtonStyles } from '@discordeno/bot';

import userRepository from '../../database/repositories/userRepository.js';
import { mentionUser } from '../../utils/discord/userUtils.js';
import relationshipRepostory from '../../database/repositories/relationshipRepostory.js';
import { MessageFlags } from "@discordeno/bot";
import { createCommand } from '../../structures/command/createCommand.js';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';

const executeDivorce = async (ctx: ComponentInteractionContext): Promise<void> => {
  const authorData = await userRepository.ensureFindUser(ctx.user.id);
  if (!authorData.married)
    return ctx.makeMessage({
      content: ctx.prettyResponse('warn', 'commands:divorciar.author-single'),
      components: [],
    });

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:divorciar.confirmed', {
      author: mentionUser(ctx.user.id),
      mention: mentionUser(authorData.married),
    }),
    components: [],
  });

  await relationshipRepostory.executeDivorce(ctx.user.id, authorData.married);
};

const DivorceCommand = createCommand({
  path: '',
  name: 'divorciar',
  nameLocalizations: { 'en-US': 'divorce' },
  description: '「💔」・Divorcie de seu atual cônjuje',
  descriptionLocalizations: { 'en-US': '「💔」・Divorce from your current spouse' },
  category: 'fun',
  authorDataFields: ['married'],
  commandRelatedExecutions: [executeDivorce],
  execute: async (ctx, finishCommand) => {
    if (!ctx.authorData.married)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('warn', 'commands:divorciar.author-single'),
          flags: MessageFlags.Ephemeral,
        }),
      );

    const confirmButton = createButton({
      customId: createCustomId(0, ctx.author.id, ctx.originalInteractionId),
      label: ctx.locale('commands:divorciar.divorce'),
      style: ButtonStyles.Success,
    });

    ctx.makeMessage({
      content: ctx.prettyResponse('question', 'commands:divorciar.confirmation', {
        married: ctx.authorData.married,
      }),
      components: [createActionRow([confirmButton])],
    });

    finishCommand();
  },
});

export default DivorceCommand;
