import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { inspect } from 'node:util';

import { createEmbed } from '../../utils/discord/embedUtils';
import { bot } from '../../index';
import { createCommand } from '../../structures/command/createCommand';

const AngryCommand = createCommand({
  path: '',
  name: 'eval',
  description: '[DEV] Evaleda de criia',
  options: [
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'script',
      description: 'Scriptzinho dos casas',
      required: true,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx) => {
    try {
      // eslint-disable-next-line no-eval
      let evaled = await eval(ctx.getOption('script', false, true));
      evaled = inspect(evaled, { depth: 1 });
      evaled = evaled.replace(new RegExp(`${bot.token}`, 'g'), undefined);

      if (evaled.length > 1800) evaled = `${evaled.slice(0, 1800)}...`;
      await ctx.makeMessage({ content: `\`\`\`js\n ${evaled}\`\`\`` });
      return;
    } catch (err) {
      if (err instanceof Error && err.stack) {
        const errorMessage = err.stack.length > 3800 ? `${err.stack.slice(0, 3800)}...` : err.stack;

        const embed = createEmbed({
          title: '<:negacao:759603958317711371> | Erro',
          color: 0xff0000,
          description: `\`\`\`js\n${errorMessage}\`\`\``,
        });

        await ctx.makeMessage({ embeds: [embed] });
      }
    }
  },
});

export default AngryCommand;
