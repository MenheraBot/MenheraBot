import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';

export default class InventoryInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'inventario',
      description: '【ＲＰＧ】📦 | Abra o inventário de alguém',
      category: 'roleplay',
      options: [
        {
          name: 'user',
          description: 'O usuário que queres ver o inventário',
          type: 'USER',
          required: false,
        },
      ],
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const mentioned = ctx.options.getUser('user') ?? ctx.author;

    const user = await ctx.client.repositories.roleplayRepository.findUser(mentioned.id);
    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    const embed = new MessageEmbed()
      .setThumbnail(mentioned.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.locale('commands:inventario.title', { user: mentioned.username }))
      .setColor(ctx.data.user.selectedColor);

    const text = user.inventory.map(
      (a) =>
        `• **${ctx.locale(`items:${a.id as 1}.name`)}** | ${ctx.locale(
          'common:roleplay.level',
        )} - **${a.level}** (${a.amount}) `,
    );

    embed.setDescription(
      text.length > 0 ? text.join('\n') : ctx.locale('commands:inventario.no-items'),
    );

    ctx.makeMessage({ embeds: [embed] });
  }
}
