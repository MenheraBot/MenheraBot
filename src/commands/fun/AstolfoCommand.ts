import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import { toWritableUTF } from '@utils/Util';
import { VangoghRoutes, requestVangoghImage } from '@utils/VangoghRequests';

export default class AstolfoCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'astolfo',
      description: '「🍆」・É grande, né? Disse o astolfo para aquilo que você o disse',
      descriptionLocalizations: {
        'en-US': "「🍆」・It's big, right? Said the astolfo for what you said",
      },
      options: [
        {
          name: 'frase',
          nameLocalizations: { 'en-US': 'phrase' },
          type: 'STRING',
          description: 'Frase para o Astolfo falar',
          descriptionLocalizations: { 'en-US': 'Phrase for Astolfo to speak' },
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const text = ctx.options.getString('frase', true);

    const res = await requestVangoghImage(VangoghRoutes.Astolfo, { text: toWritableUTF(text) });

    if (res.err) {
      await ctx.makeMessage({ content: `${emojis.error} | ${ctx.locale('common:http-error')}` });
      return;
    }

    await ctx.makeMessage({
      files: [new MessageAttachment(res.data, 'astolfo.png')],
    });
  }
}
