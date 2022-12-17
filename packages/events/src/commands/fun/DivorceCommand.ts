import { ButtonStyles } from 'discordeno/types';

import userRepository from '../../database/repositories/userRepository';
import { mentionUser } from '../../utils/discord/userUtils';
import relationshipRepostory from '../../database/repositories/relationshipRepostory';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { createCommand } from '../../structures/command/createCommand';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';

const executeDivorce = async (ctx: ComponentInteractionContext): Promise<void> => {
  const authorData = await userRepository.ensureFindUser(ctx.author.id);
  if (!authorData.married)
    return ctx.makeMessage({
      content: ctx.prettyResponse('warn', 'commands:divorciar.author-single'),
      components: [],
    });

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:divorciar.confirmed', {
      author: mentionUser(ctx.author.id),
      mention: mentionUser(authorData.married),
    }),
    components: [],
  });

  await relationshipRepostory.executeDivorce(ctx.author.id, authorData.married);
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
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const confirmButton = createButton({
      customId: createCustomId(0, ctx.author.id, ctx.commandId),
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
