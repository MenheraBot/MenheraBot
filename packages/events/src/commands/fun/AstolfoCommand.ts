import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { toWritableUtf } from '../../utils/miscUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';

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
      maxLength: 300,
      description: 'Frase para o Astolfo falar',
      descriptionLocalizations: { 'en-US': 'Phrase for Astolfo to speak' },
      required: true,
    },
  ],
  category: 'fun',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    let text = ctx.getOption<string>('frase', false, true);

    if (ctx.interaction.data?.resolved?.users)
      ctx.interaction.data.resolved.users.forEach((resolved) => {
        text = text.replaceAll(`<@${resolved.id}>`, getDisplayName(resolved, true));
      });

    await ctx.defer();

    const res = await vanGoghRequest(VanGoghEndpoints.Astolfo, {
      text: toWritableUtf(text),
    });

    if (res.err) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:http-error'),
      });

      return finishCommand();
    }

    await ctx.makeMessage({
      file: {
        name: 'astolfo.png',
        blob: res.data,
      },
    });

    finishCommand();
  },
});

export default AstolfoCommand;
