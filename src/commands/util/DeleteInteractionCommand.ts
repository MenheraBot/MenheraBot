import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton } from 'discord.js-light';
import Util from '@utils/Util';
import HttpRequests from '@utils/HTTPrequests';

export default class DeleteInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'delete',
      description: '「☢️」・Quer deletar suas informações de meu banco de dados? Use este comando',
      category: 'util',
      cooldown: 30,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const FirstButton = new MessageButton()
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.translate('btn_confirm'))
      .setStyle('DANGER');

    const usages = await HttpRequests.getUserDeleteUsages(ctx.author.id);

    if (!usages.err && usages.count && usages.count >= 5) {
      await ctx.client.repositories.blacklistRepository.ban(
        ctx.author.id,
        '[PERMABAN] Tentou burlar o cooldown da Menhera excluindo a conta diversas vezes',
      );
      ctx.makeMessage({ content: ctx.prettyResponse('warn', 'ban'), ephemeral: true });
      return;
    }

    ctx.makeMessage({
      content: ctx.prettyResponse('warn', 'confirm'),
      components: [{ type: 'ACTION_ROW', components: [FirstButton] }],
    });

    const collect = await Util.collectComponentInteractionWithId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      5000,
    );

    if (!collect) {
      ctx.makeMessage({
        components: [
          {
            type: 'ACTION_ROW',
            components: [FirstButton.setDisabled(true).setLabel(ctx.locale('common.timesup'))],
          },
        ],
      });
    }
    await ctx.client.repositories.userRepository.delete(ctx.author.id);
    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'acepted'),
      components: [],
    });
  }
}
