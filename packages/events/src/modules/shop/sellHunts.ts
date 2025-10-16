import shopRepository from '../../database/repositories/shopRepository.js';
import { MessageFlags } from '../../utils/discord/messageUtils.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { DatabaseHuntingTypes } from '../hunt/types.js';
import { huntValues } from './constants.js';

const sellHunts = async (
  ctx: ChatInputInteractionContext,
  finishCommand: (args?: unknown) => void,
): Promise<void> => {
  const huntType = ctx.getOption<DatabaseHuntingTypes>('tipo', false, true);
  const amount = ctx.getOption<number>('quantidade', false, true);

  if (amount > ctx.authorData[huntType])
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:loja.dataVender.poor', {
          var: ctx.locale(`common:${huntType}`),
        }),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  shopRepository.executeSellHunt(ctx.author.id, huntType, amount, amount * huntValues[huntType]);

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:loja.dataVender.success', {
      value: amount,
      cost: amount * huntValues[huntType],
      quantity: ctx.authorData[huntType] - amount,
      hunt: ctx.locale(`common:${huntType}`),
      emoji: ctx.safeEmoji(huntType),
      star: ctx.authorData.estrelinhas + amount * huntValues[huntType],
    }),
  });

  finishCommand();
};

export { sellHunts };
