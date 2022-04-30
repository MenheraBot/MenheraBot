import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class FluffetyCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'fluffety',
      description: '「🐰」・Cuide da sua fofura de estimação',
      category: 'fluffety',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'Dono do flufetty que você quer ver',
          required: false,
        },
      ],
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const flufettyOwner = ctx.options.getUser('user', false) ?? ctx.author;
    const fluffety = await ctx.client.repositories.fluffetyRepository.findUserFluffety(
      flufettyOwner.id,
    );

    if (!fluffety && ctx.author.id === flufettyOwner.id) return FluffetyCommand.adoptFlufetty(ctx);
  }

  static async adoptFlufetty(ctx: InteractionCommandContext): Promise<void> {
    console.log(ctx);
  }
}
