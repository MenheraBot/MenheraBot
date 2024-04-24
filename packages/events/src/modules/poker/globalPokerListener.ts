import pokerRepository from '../../database/repositories/pokerRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { logger } from '../../utils/logger';
import { minutesToMillis } from '../../utils/miscUtils';
import { startPokerTimeout } from './timerManager';
import { TimerActionType } from './types';

const executeJoinQueue = async (ctx: ComponentInteractionContext): Promise<void> => {
  const playersInQueue = await pokerRepository.getTotalUsersInQueue();

  if (playersInQueue === 0) {
    // FIXME(ySnoopyDogy): Update this to also keep in mind that a table can exists even if there is no people in the queue at the moment
    startPokerTimeout(`exit_queue:${ctx.user.id}`, {
      executeAt: Date.now() + minutesToMillis(10),
      interactionToken: ctx.interaction.token,
      type: TimerActionType.EXIT_GLOBAL_QUEUE,
      userId: `${ctx.user.id}`,
      userLanguage: ctx.guildLocale,
    });

    await pokerRepository.addUserToQueue(ctx.user.id);

    return ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:poker.queue.in-queue'),
      components: [],
    });
  }

  logger.debug('Yiipieee! Lets start a match');
};

const executeGlobalPokerRelatedInteractions = async (
  ctx: ComponentInteractionContext,
): Promise<void> => {
  ctx.ack();
  const [action] = ctx.sentData;

  if (action === 'JOIN_QUEUE') return executeJoinQueue(ctx);
};

export { executeGlobalPokerRelatedInteractions };
