import shopRepository from '../../database/repositories/shopRepository';
import InteractionContext from '../../structures/command/InteractionContext';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { huntValues } from './constants';

const buyRolls = async (ctx: InteractionContext, finishCommand: () => void): Promise<void> => {
  const amount = ctx.getOption<number>('quantidade', false, true);

  const totalCost = amount * huntValues.roll;

  if (totalCost > ctx.authorData.estrelinhas) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:loja.dataRolls_fields.buy_rolls.poor'),
      flags: MessageFlags.EPHEMERAL,
    });

    return finishCommand();
  }

  await shopRepository.executeBuyRolls(ctx.author.id, amount, totalCost);

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:loja.dataRolls_fields.buy_rolls.success', {
      quantity: amount,
      value: totalCost,
      rolls: ctx.authorData.rolls + amount,
      stars: ctx.authorData.estrelinhas - totalCost,
    }),
  });

  finishCommand();
};

export { buyRolls };
