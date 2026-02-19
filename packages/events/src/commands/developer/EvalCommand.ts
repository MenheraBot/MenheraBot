import { ApplicationCommandOptionTypes, ButtonStyles } from '@discordeno/bot';
import { inspect } from 'node:util';

import {
  eventModel,
  farmerModel,
  feirinhaOrderModel as ordersModel,
  usersModel,
} from '../../database/collections.js';
import { MainRedisClient as redis } from '../../database/databases.js';
import userRepository from '../../database/repositories/userRepository.js';
import { bot } from '../../index.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { enableTcp, enableUnixSocket } from '../../utils/vanGoghRequest.js';
import { InteractionContext } from '../../types/menhera.js';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';

// This is odd, but its needed so the eslint dont get angry with unused imports
() => {
  return [
    userRepository,
    enableTcp,
    enableUnixSocket,
    usersModel,
    redis,
    farmerModel,
    eventModel,
    ordersModel,
  ];
};

const executeEval = async (ctx: InteractionContext, toEval: string) => {
  const id = { id: `${ctx.user.id}` };

  const rfarm = async () => {
    await farmerModel.updateOne(id, {
      $set: {
        items: [{ id: 0, amount: 4 }],
        silo: [
          { plant: 1, weight: 3 },
          { plant: 2, weight: 1.7 },
          { plant: 3, weight: 2.3 },
          { plant: 4, weight: 2.4 },
          { plant: 5, weight: 1 },
          { plant: 6, weight: 4.9 },
          { plant: 7, weight: 2.5 },
          { plant: 8, weight: 2.7 },
          { plant: 9, weight: 0.6 },
          { plant: 10, weight: 1.3 },
          { weight: 3.2, plant: 11 },
          { plant: 12, weight: 1 },
          { plant: 13, weight: 3.2 },
          { plant: 14, weight: 1.2 },
          { plant: 15, weight: 4.8 },
          { plant: 16, weight: 2 },
          { plant: 17, weight: 1.9 },
          { plant: 18, weight: 1.3 },
          { plant: 19, weight: 4 },
          { plant: 20, weight: 4.4 },
          { weight: 2.8, plant: 21 },
          { weight: 5.7, plant: 22 },
          { weight: 1, plant: 23 },
          { plant: 24, weight: 4.5 },
          { plant: 0, weight: 1.6 },
          { plant: 1, quality: 2, weight: 3 },
          { plant: 2, quality: 2, weight: 1.7 },
          { plant: 3, quality: 2, weight: 2.3 },
          { plant: 4, quality: 2, weight: 2.4 },
          { plant: 5, quality: 2, weight: 1 },
          { plant: 6, quality: 2, weight: 4.9 },
          { plant: 7, quality: 2, weight: 2.5 },
          { plant: 8, quality: 2, weight: 2.7 },
          { plant: 9, quality: 2, weight: 0.6 },
          { plant: 10, quality: 2, weight: 1.3 },
          { quality: 2, weight: 3.2, plant: 11 },
          { plant: 12, quality: 2, weight: 1 },
          { plant: 13, quality: 2, weight: 3.2 },
          { plant: 14, quality: 2, weight: 1.2 },
          { plant: 15, quality: 2, weight: 4.8 },
          { plant: 16, quality: 2, weight: 2 },
          { plant: 17, quality: 2, weight: 1.9 },
          { plant: 18, quality: 2, weight: 1.3 },
          { plant: 19, quality: 2, weight: 4 },
          { plant: 20, quality: 2, weight: 4.4 },
          { quality: 2, weight: 2.8, plant: 21 },
          { quality: 2, weight: 5.7, plant: 22 },
          { quality: 2, weight: 2, plant: 23 },
          { plant: 24, quality: 2, weight: 4.5 },
          { plant: 0, quality: 2, weight: 1.6 },
          { plant: 1, quality: 0, weight: 3 },
          { plant: 2, quality: 0, weight: 1.7 },
          { plant: 3, quality: 0, weight: 2.3 },
          { plant: 4, quality: 0, weight: 2.4 },
          { plant: 5, quality: 0, weight: 1 },
          { plant: 6, quality: 0, weight: 4.9 },
          { plant: 7, quality: 0, weight: 2.5 },
          { plant: 8, quality: 0, weight: 2.7 },
          { plant: 9, quality: 0, weight: 0.6 },
          { plant: 10, quality: 0, weight: 1.3 },
          { quality: 0, weight: 3.2, plant: 11 },
          { plant: 12, quality: 0, weight: 1 },
          { plant: 13, quality: 0, weight: 3.2 },
          { plant: 14, quality: 0, weight: 1.2 },
          { plant: 15, quality: 0, weight: 4.8 },
          { plant: 16, quality: 0, weight: 2 },
          { plant: 17, quality: 0, weight: 1.9 },
          { plant: 18, quality: 0, weight: 1.3 },
          { plant: 19, quality: 0, weight: 4 },
          { plant: 20, quality: 0, weight: 4.4 },
          { quality: 0, weight: 2.8, plant: 21 },
          { quality: 0, weight: 5.7, plant: 22 },
          { quality: 0, weight: 1, plant: 23 },
          { plant: 24, quality: 0, weight: 4.5 },
          { plant: 0, quality: 0, weight: 1.6 },
        ],
        seeds: [
          { amount: 1, plant: 1 },
          { amount: 1, plant: 2 },
          { amount: 1, plant: 3 },
          { amount: 1, plant: 4 },
          { amount: 1, plant: 5 },
          { amount: 1, plant: 6 },
          { amount: 1, plant: 7 },
          { amount: 1, plant: 8 },
          { amount: 1, plant: 9 },
          { amount: 1, plant: 10 },
          { amount: 1, plant: 11 },
          { amount: 1, plant: 12 },
          { amount: 1, plant: 13 },
          { amount: 1, plant: 14 },
          { amount: 1, plant: 15 },
          { amount: 1, plant: 16 },
          { amount: 1, plant: 17 },
          { amount: 1, plant: 18 },
          { amount: 1, plant: 19 },
          { amount: 1, plant: 20 },
          { amount: 1, plant: 21 },
          { amount: 1, plant: 22 },
          { amount: 1, plant: 23 },
          { amount: 1, plant: 24 },
        ],
      },
    });

    await redis.del(`farmer:${ctx.user.id}`);
  };

  () => {
    return [id, rfarm];
  };

  try {
    let evaled = await eval(toEval);
    evaled = inspect(evaled, { depth: 4 });
    evaled = evaled.replace(new RegExp(`${bot.rest.token}`, 'g'), undefined);

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

    const messageEval = toEval.length > 1800 ? `${toEval.slice(0, 1800)}...` : toEval;

    return ctx.makeMessage({
      content: `\`\`\`js\n${messageEval}\n\`\`\``,
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
