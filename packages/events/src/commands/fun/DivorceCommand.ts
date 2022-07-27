import { ButtonStyles } from 'discordeno/types';

import { MessageFlags } from '../../utils/discord/messageUtils';
import { createCommand } from '../../structures/command/createCommand';
import {
  createActionRow,
  createButton,
  generateCustomId,
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
  execute: async (ctx) => {
    if (!ctx.authorData.married)
      return ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'commands:divorciar.author-single'),
        flags: MessageFlags.EPHEMERAL,
      });

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
        marry: ctx.authorData.married,
      }),
      components: [createActionRow([confirmButton, cancelButton])],
    });

    const collected = await collectResponseComponentInteraction(
      ctx.channelId,
      ctx.author.id,
      `${ctx.interaction.id}`,
    );
  },
});

export default DivorceCommand;
