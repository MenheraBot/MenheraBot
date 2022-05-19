import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import { toWritableUTF } from '@utils/Util';
import { PicassoRoutes, requestPicassoImage } from '@utils/PicassoRequests';

export default class AstolfoCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'astolfo',
      description: "「🍆」・It's big, right? Said the astolfo for what you said",
      descriptionLocalizations: {
        'pt-BR': '「🍆」・É grande, né? Disse o astolfo para aquilo que você o disse',
      },
      options: [
        {
          name: 'phrase',
          nameLocalizations: { 'pt-BR': 'frase' },
          type: 'STRING',
          description: 'Phrase for Astolfo to speak',
          descriptionLocalizations: { 'pt-BR': 'Frase para o Astolfo falar' },
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const text = ctx.options.getString('phrase', true);
    await ctx.defer();

    const res = await requestPicassoImage(
      PicassoRoutes.Astolfo,
      { text: toWritableUTF(text) },
      ctx,
    );

    if (res.err) {
      await ctx.defer({ content: `${emojis.error} | ${ctx.locale('common:http-error')}` });
      return;
    }

    await ctx.defer({
      files: [new MessageAttachment(res.data, 'astolfo.png')],
    });
  }
}
