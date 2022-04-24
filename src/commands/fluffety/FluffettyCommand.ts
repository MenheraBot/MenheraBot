import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class FluffetyCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'fluffety',
      description: '「🐰」・Nada melhor que cuidar de seu bichinho de estimação',
      category: 'fluffety',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const fluffety = await ctx.client.repositories.fluffetyRepository.findUserFluffety(
      ctx.author.id,
    );

    console.log(fluffety);
  }
}
