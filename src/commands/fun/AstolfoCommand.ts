import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { emojis } from '@structures/Constants';
import { toWritableUTF } from '@utils/Util';

export default class AstolfoCommand extends InteractionCommand {
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
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const text = ctx.options.getString('frase', true);
    await ctx.defer();

    const res = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'astolfo',
          data: { text: toWritableUTF(text) },
        })
      : await HttpRequests.astolfoRequest(toWritableUTF(text));

    if (res.err) {
      await ctx.defer({ content: `${emojis.error} | ${ctx.locale('common:http-error')}` });
      return;
    }

    await ctx.defer({
      files: [new MessageAttachment(res.data, 'astolfo.png')],
    });
  }
}
