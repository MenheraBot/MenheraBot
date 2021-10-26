import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class AboutmeInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'sobremim',
      description: '「💬」・Mude o seu sobremim (A mensagem que aparece em seu perfil)',
      category: 'util',
      options: [
        {
          type: 'STRING',
          name: 'frase',
          description: 'Frase para colocar em seu sobre mim. No máximo 200 caracteres',
          required: true,
        },
      ],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const nota = ctx.options.getString('frase', true);

    if (nota.length > 200) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'args-limit'),
        ephemeral: true,
      });
      return;
    }

    await ctx.client.repositories.userRepository.update(ctx.author.id, { nota });

    await ctx.makeMessage({ content: ctx.prettyResponse('success', 'success') });
  }
}
