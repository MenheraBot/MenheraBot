import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';

export default class InventoryInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'inventario',
      description:
        '【ＲＰＧ】Veja o inventário de seu personagem, de suas casas, e tome ações diante deles',
      category: 'rpg',
      cooldown: 8,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await this.client.repositories.rpgRepository.findUser(ctx.interaction.user.id);
    if (!user) {
      ctx.replyT('error', 'common:not-registred');
      return;
    }

    const embed = new MessageEmbed().setTitle(
      ctx.translate('first.title', { user: ctx.interaction.user.username }),
    );

    ctx.reply({ embeds: [embed] });
  }
}
