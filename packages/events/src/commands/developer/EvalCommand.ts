/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';
import { inspect } from 'node:util';

import { eventModel, farmerModel, usersModel } from '../../database/collections';
import { MainRedisClient as redis } from '../../database/databases';
import userRepository from '../../database/repositories/userRepository';
import { bot } from '../../index';
import { createCommand } from '../../structures/command/createCommand';
import { createEmbed } from '../../utils/discord/embedUtils';
import { enableTcp, enableUnixSocket } from '../../utils/vanGoghRequest';
import { InteractionContext } from '../../types/menhera';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';

const noop = (..._args: unknown[]) => undefined;
noop(userRepository, enableTcp, enableUnixSocket, usersModel, redis, farmerModel, eventModel);

const executeEval = async (ctx: InteractionContext, toEval: string) => {
  try {
    // eslint-disable-next-line no-eval
    let evaled = await eval(toEval);
    evaled = inspect(evaled, { depth: 4 });
    evaled = evaled.replace(new RegExp(`${bot.token}`, 'g'), undefined);

    if (evaled.length > 1800) evaled = `${evaled.slice(0, 1800)}...`;
    await ctx.makeMessage({ content: `\`\`\`js\n ${evaled}\`\`\``, components: [] });
    return;
  } catch (err) {
    if (err instanceof Error && err.stack) {
      const errorMessage = err.stack.length > 3800 ? `${err.stack.slice(0, 3800)}...` : err.stack;

      const embed = createEmbed({
        title: '<:negacao:759603958317711371> | Erro',
        color: 0xff0000,
        description: `\`\`\`js\n${errorMessage}\`\`\``,
      });

      await ctx.makeMessage({ embeds: [embed], components: [], content: '' });
    }
  }
};

const handleConfirm = async (ctx: ComponentInteractionContext) => {
  const toEval = await redis.get(`eval:${ctx.originalInteractionId}`);

  if (!toEval) return ctx.makeMessage({ content: 'perdi o eval', components: [] });

  await redis.del(`eval:${ctx.originalInteractionId}`);

  return executeEval(ctx, toEval);
};

const EvalCommand = createCommand({
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
  authorDataFields: ['id'],
  commandRelatedExecutions: [handleConfirm],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const toEval = ctx.getOption<string>('script', false, true);

    if (process.env.NODE_ENV !== 'production') return executeEval(ctx, toEval);

    if (toEval.includes('.flush'))
      return ctx.makeMessage({ content: 'não VIIAAAAJAAAA querer limpar o redis de prod mano' });

    await redis.setex(`eval:${ctx.originalInteractionId}`, 900, toEval);

    return ctx.makeMessage({
      content: `\`\`\`js\n${toEval}\n\`\`\``,
      components: [
        createActionRow([
          createButton({
            label: 'executar em prod',
            style: ButtonStyles.Danger,
            customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId),
          }),
        ]),
      ],
    });
  },
});

export default EvalCommand;
