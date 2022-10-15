import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { toWritableUtf } from '../../utils/miscUtils';
import { createCommand } from '../../structures/command/createCommand';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';

const AstolfoCommand = createCommand({
  path: '',
  name: 'astolfo',
  description: '「🍆」・É grande, né? Disse o astolfo para aquilo que você o disse',
  descriptionLocalizations: {
    'en-US': "「🍆」・It's big, right? Said the astolfo for what you said",
  },
  options: [
    {
      name: 'frase',
      nameLocalizations: { 'en-US': 'phrase' },
      type: ApplicationCommandOptionTypes.String,
      description: 'Frase para o Astolfo falar',
      descriptionLocalizations: { 'en-US': 'Phrase for Astolfo to speak' },
      required: true,
    },
  ],
  category: 'fun',
  authorDataFields: [],
  execute: async (ctx) => {
    const text = ctx.getOption<string>('frase', false, true);

    await ctx.defer();

    const res = await vanGoghRequest(VanGoghEndpoints.Astolfo, {
      text: toWritableUtf(text),
    });

    if (res.err) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:http-error'),
      });
      return;
    }

    await ctx.makeMessage({
      file: {
        name: 'astolfo.png',
        blob: res.data,
      },
    });
  },
});

export default AstolfoCommand;
