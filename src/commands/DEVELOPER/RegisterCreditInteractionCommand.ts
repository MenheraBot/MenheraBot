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
          name: 'type',
          description: 'Tipo do tema',
          type: 'STRING',
          choices: [
            { name: 'card_background', value: 'addCardBackgroundTheme' },
            { name: 'cards', value: 'addCardsTheme' },
            { name: 'profile', value: 'addProfileTheme' },
            { name: 'table', value: 'addTableTheme' },
          ],
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
    const themeType = ctx.options.getString('type', true) as
      | 'addCardBackgroundTheme'
      | 'addCardsTheme'
      | 'addProfileTheme'
      | 'addTableTheme';

    await ctx.client.repositories.creditsRepository.registerTheme(themeId, userId, royalty);
    await ctx.client.repositories.themeRepository[themeType](userId, themeId);

    ctx.makeMessage({
      content: ctx.prettyResponseText(
        'success',
        `Tema \`${themeId}\` registrado com sucesso! Dono: <@${userId}> (${userId})\nEle já recebeu o tema, basta dar a recompensa em estrelinhas`,
      ),
    });
  }
}
