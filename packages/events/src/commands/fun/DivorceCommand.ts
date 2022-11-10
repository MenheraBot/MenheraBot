import { ButtonStyles } from 'discordeno/types';

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
  name: 'divorciar',
  nameLocalizations: { 'en-US': 'divorce' },
  description: '「💔」・Divorcie de seu atual cônjuje',
  descriptionLocalizations: { 'en-US': '「💔」・Divorce from your current spouse' },
  category: 'fun',
  authorDataFields: ['married'],
  execute: async (ctx, finishCommand) => {
    if (!ctx.authorData.married)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('warn', 'commands:divorciar.author-single'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const confirmButton = createButton({
      customId: generateCustomId('CONFIRM', ctx.interaction.id),
      label: ctx.locale('commands:divorciar.divorce'),
      style: ButtonStyles.Success,
    });

    const cancelButton = createButton({
      customId: generateCustomId('CANCEL', ctx.interaction.id),
      label: ctx.locale('commands:divorciar.cancel'),
      style: ButtonStyles.Danger,
    });

    ctx.makeMessage({
      content: ctx.prettyResponse('question', 'commands:divorciar.confirmation', {
        married: ctx.authorData.married,
      }),
      components: [createActionRow([confirmButton, cancelButton])],
    });

    const collected = await collectResponseComponentInteraction(
      ctx.channelId,
      ctx.author.id,
      `${ctx.interaction.id}`,
    );

    if (!collected)
      return finishCommand(
        ctx.makeMessage({
          components: [
            createActionRow(
              disableComponents(ctx.locale('common:timesup'), [confirmButton, cancelButton]),
            ),
          ],
        }),
      );

    const selectedButton = resolveCustomId(collected.data?.customId as string);

    if (selectedButton === 'CANCEL')
      return finishCommand(
        ctx.makeMessage({
          components: [],
          content: ctx.prettyResponse('error', 'commands:divorciar.canceled'),
        }),
      );

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:divorciar.confirmed', {
        author: mentionUser(ctx.author.id),
        mention: mentionUser(ctx.authorData.married),
      }),
      components: [],
    });

    await relationshipRepostory.executeDivorce(ctx.author.id, ctx.authorData.married);
    finishCommand();
  },
});

export default DivorceCommand;
