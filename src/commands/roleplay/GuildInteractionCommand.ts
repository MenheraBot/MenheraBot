import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';

export default class InventoryInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'guilda',
      description: '【ＲＰＧ】Entre na guilda de Boleham',
      category: 'roleplay',
      options: [
        {
          name: 'cômodo',
          description: 'Para que vieste à guilda?',
          type: 'STRING',
          required: true,
          choices: [
            { name: 'Venda de Itens', value: 'sell' },
            { name: 'Compra de Ferramentas', value: 'buy' },
            { name: 'Mural de Quests', value: 'quest' },
          ],
        },
      ],
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    const option = ctx.options.getString('cômodo', true);

    if (option === 'quest') {
      ctx.makeMessage({ content: ctx.prettyResponse('wink', 'common:soon') });
      return;
    }

    if (option === 'sell') return InventoryInteractionCommand.sellItems(ctx);
  }

  static async sellItems(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed().setTitle(ctx.locale('commands:guilda.title'));

    ctx.makeMessage({ embeds: [embed] });
  }
}
