import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import { toWritableUTF } from '@utils/Util';
import { VangoghRoutes, requestVangoghImage } from '@utils/VangoghRequests';

export default class PhiloCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'filosofia',
      nameLocalizations: { 'en-US': 'philosophy' },
      description: '「💭」・Ser ou não ser, eis a questão. Mande Aristóteles dizer algo.',
      descriptionLocalizations: {
        'en-US': '「💭」・To be or not to be, that is the question. Have Aristotle say something.',
      },
      options: [
        {
          name: 'frase',
          nameLocalizations: { 'en-US': 'text' },
          type: 'STRING',
          description: 'Frase para enviar ao Aristóteles',
          descriptionLocalizations: { 'en-US': 'Text to sendo to Aristotle' },
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

    const res = await requestVangoghImage(VangoghRoutes.Philo, { text: toWritableUTF(text) });

    if (res.err) {
      await ctx.defer({ content: `${emojis.error} | ${ctx.locale('common:http-error')}` });
      return;
    }

    await ctx.defer({
      files: [new MessageAttachment(res.data, 'aristoteles.png')],
    });
  }
}
