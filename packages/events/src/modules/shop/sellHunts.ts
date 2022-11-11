import shopRepository from '../../database/repositories/shopRepository';
import { EMOJIS } from '../../structures/constants';
import { MessageFlags } from '../../utils/discord/messageUtils';
import InteractionContext from '../../structures/command/InteractionContext';
import { DatabaseHuntingTypes } from '../hunt/types';
import { huntValues } from './prices';

const sellHunts = async (
  ctx: InteractionContext,
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
      emoji: EMOJIS[huntType],
      star: ctx.authorData.estrelinhas + amount * huntValues[huntType],
    }),
  });

  finishCommand();
};

export { sellHunts };
