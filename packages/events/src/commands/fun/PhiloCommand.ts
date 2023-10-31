import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { MessageFlags } from '../../utils/discord/messageUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';
import { createCommand } from '../../structures/command/createCommand';
import { toWritableUtf } from '../../utils/miscUtils';
import { getDisplayName } from '../../utils/discord/userUtils';

const PhiloCommand = createCommand({
  path: '',
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
      maxLength: 300,
      type: ApplicationCommandOptionTypes.String,
      description: 'Frase para enviar ao Aristóteles',
      descriptionLocalizations: { 'en-US': 'Text to sendo to Aristotle' },
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

    const res = await vanGoghRequest(VanGoghEndpoints.Philo, { text: toWritableUtf(text) });

    if (res.err)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'common:http-error'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    ctx.makeMessage({
      file: {
        blob: res.data,
        name: 'aristoteles.png',
      },
    });

    finishCommand();
  },
});

export default PhiloCommand;
