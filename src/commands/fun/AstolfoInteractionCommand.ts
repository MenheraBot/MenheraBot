import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { emojis } from '@structures/Constants';

export default class AstolfoInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'astolfo',
      description: '「🍆」・É grande, né? Disse o asolfo para aquilo que você o disse',
      options: [
        {
          name: 'frase',
          type: 'STRING',
          description: 'Frase para enviar ao astolfo',
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const text = ctx.options.getString('frase', true);
    await ctx.defer();

    const res = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'astolfo',
          data: { text },
        })
      : await HttpRequests.astolfoRequest(text);

    if (res.err) {
      await ctx.defer({ content: `${emojis.error} | ${ctx.locale('commands:http-error')}` });
      return;
    }

    await ctx.defer({
      files: [new MessageAttachment(res.data, 'astolfo.png')],
    });
  }
}
