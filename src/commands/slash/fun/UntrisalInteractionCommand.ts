import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, TextBasedChannels } from 'discord.js';
import { emojis } from '@structures/MenheraConstants';
import Util from '@utils/Util';

export default class UntrisalInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'untrisal',
      description: '「🛑」・Termina o seu trisal',
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.data.user.trisal?.length === 0) {
      await ctx.replyT('error', 'commands:untrisal.error', {}, true);
      return;
    }

    const button = new MessageButton()
      .setStyle('SUCCESS')
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.locale('commands:untrisal.confirm'));

    await ctx.reply({
      content: `${emojis.question} | ${ctx.locale('commands:untrisal.sure')}`,
      components: [{ type: 'ACTION_ROW', components: [button] }],
    });

    const confirmed = await Util.collectComponentInteractionWithId(
      ctx.interaction.channel as TextBasedChannels,
      ctx.interaction.user.id,
      ctx.interaction.id,
      15000,
    );

    if (!confirmed) {
      ctx.editReply({
        components: [
          {
            type: 1,
            components: [button.setDisabled(true).setLabel(ctx.locale('common:timesup'))],
          },
        ],
      });
      return;
    }

    await this.client.repositories.relationshipRepository.untrisal(
      ctx.interaction.user.id,
      ctx.data.user.trisal[0],
      ctx.data.user.trisal[1],
    );
    ctx.editReply({
      content: `${emojis.success} | ${ctx.locale('commands:untrisal.done')}`,
      components: [
        { type: 'ACTION_ROW', components: [button.setDisabled(true).setStyle('PRIMARY')] },
      ],
    });
  }
}
