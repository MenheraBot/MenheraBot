import MenheraClient from 'src/MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton } from 'discord.js-light';
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
      await ctx.replyT('error', 'error', {}, true);
      return;
    }

    const button = new MessageButton()
      .setStyle('SUCCESS')
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.translate('confirm'));

    await ctx.reply({
      content: `${emojis.question} | ${ctx.translate('sure')}`,
      components: [{ type: 'ACTION_ROW', components: [button] }],
    });

    const confirmed = await Util.collectComponentInteractionWithId(
      ctx.channel,
      ctx.author.id,
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
      ctx.author.id,
      ctx.data.user.trisal[0],
      ctx.data.user.trisal[1],
    );
    ctx.editReply({
      content: `${emojis.success} | ${ctx.translate('done')}`,
      components: [
        { type: 'ACTION_ROW', components: [button.setDisabled(true).setStyle('PRIMARY')] },
      ],
    });
  }
}
