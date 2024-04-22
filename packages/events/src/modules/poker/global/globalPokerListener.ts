import pokerRepository from '../../../database/repositories/pokerRepository';
import ComponentInteractionContext from '../../../structures/command/ComponentInteractionContext';

const executeGlobalPokerRelatedInteractions = async (
  ctx: ComponentInteractionContext,
): Promise<void> => {
  const [action] = ctx.sentData;

  if (action === 'JOIN_QUEUE') {
    await pokerRepository.addUserToQueue(ctx.user.id);
    ctx.ack();
  }
};

export { executeGlobalPokerRelatedInteractions };
