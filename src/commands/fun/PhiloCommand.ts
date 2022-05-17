import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import { toWritableUTF } from '@utils/Util';
import { PicassoRoutes, requestPicassoImage } from '@utils/PicassoRequests';

export default class PhiloCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'philosophy',
      nameLocalizations: { 'pt-BR': 'filosofía' },
      description:
        '「💭」・To be or not to be, that is the question. Have Aristotle say something.',
      descriptionLocalizations: {
        'pt-BR': '「💭」・Ser ou não ser, eis a questão. Mande Aristóteles dizer algo.',
      },
      options: [
        {
          name: 'text',
          nameLocalizations: { 'pt-BR': 'frase' },
          type: 'STRING',
          description: 'Text to sendo to Aristotle',
          descriptionLocalizations: { 'pt-BR': 'Frase para enviar ao Aristóteles' },
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const text = ctx.options.getString('text', true);
    await ctx.defer();

    const res = await requestPicassoImage(PicassoRoutes.Philo, { text: toWritableUTF(text) }, ctx);

    if (res.err) {
      await ctx.defer({ content: `${emojis.error} | ${ctx.locale('common:http-error')}` });
      return;
    }

    await ctx.defer({
      files: [new MessageAttachment(res.data, 'aristoteles.png')],
    });
  }
}
