import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class RegisterCreditSlashInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'registercredit',
      description: 'Registra um credito de tema',
      category: 'dev',
      options: [
        {
          type: 'USER',
          name: 'owner',
          description: 'Dono do tema',
          required: true,
        },
        {
          name: 'theme',
          description: 'Id do tema',
          type: 'INTEGER',
          required: true,
        },
        {
          name: 'royalty',
          description: 'Porcentagem de participação do usuário sob este tema',
          type: 'INTEGER',
          required: false,
        },
      ],
      defaultPermission: false,
      devsOnly: true,
      cooldown: 1,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const userId = ctx.options.getUser('owner', true).id;
    const themeId = ctx.options.getInteger('theme', true);
    const royalty = ctx.options.getInteger('royalty') ?? 1;

    await ctx.client.repositories.creditsRepository.registerTheme(themeId, userId, royalty);

    ctx.makeMessage({
      content: ctx.prettyResponseText(
        'success',
        `Tema \`${themeId}\` registrado com sucesso! Dono: <@${userId}> (${userId}) `,
      ),
    });
  }
}
