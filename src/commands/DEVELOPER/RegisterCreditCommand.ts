import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { debugError } from '@utils/Util';

export default class RegisterCreditSlashCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'registercredit',
      description: '[DEV] Registra um crédito de algum tema',
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
      devsOnly: true,
      cooldown: 1,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('owner', true);
    const themeId = ctx.options.getInteger('theme', true);
    const royalty = ctx.options.getInteger('royalty') ?? 7;
    const themeType = ctx.options.getString('type', true) as
      | 'addCardBackgroundTheme'
      | 'addCardsTheme'
      | 'addProfileTheme'
      | 'addTableTheme';

    await ctx.client.repositories.creditsRepository.registerTheme(themeId, user.id, royalty);
    await ctx.client.repositories.themeRepository[themeType](user.id, themeId);

    ctx.makeMessage({
      content: ctx.prettyResponseText(
        'success',
        `Tema \`${themeId}\` registrado com sucesso! Dono: <@${user.id}> (${user.id})\nEle já recebeu o tema, basta dar a recompensa em estrelinhas`,
      ),
    });

    user
      .send({
        content: `:sparkles: **OBRIGADA POR CRIAR UM TEMA! **:sparkles:\n\nSeu tema \`${ctx.locale(
          `data:themes.${themeId as 1}.name`,
        )}\` foi registrado pela minha dona.\nEle já está em seu perfil (até por que tu que fez, é teu por direito >.<). Divulge bastante teu tema, que tu ganha uma parte em estrelinhas pelas compras de seu tema!`,
      })
      .catch(debugError);

    const userBadges = await ctx.client.repositories.badgeRepository.getBadges(user.id);

    if (!userBadges) return;

    if (userBadges.badges.some((a) => a.id === 15)) return;

    await ctx.client.repositories.badgeRepository.addBadge(user.id, 15);
  }
}
