import pokerRepository from '../../database/repositories/pokerRepository';
import starsRepository from '../../database/repositories/starsRepository';
import userRepository from '../../database/repositories/userRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { minutesToMillis } from '../../utils/miscUtils';
import { DEFAULT_CHIPS } from './constants';
import { setupGame } from './matchManager';
import { startPokerTimeout } from './timerManager';
import { TimerActionType } from './types';

const executeJoinQueue = async (ctx: ComponentInteractionContext): Promise<void> => {
  const playersInQueue = await pokerRepository.getUsersInQueue();

  if (playersInQueue.length === 0) {
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

  const joinedUsers = [...playersInQueue, `${ctx.user.id}`];

  const isSomeoneInMatch = await Promise.all(joinedUsers.map(pokerRepository.isUserInMatch));

  if (isSomeoneInMatch.includes(true))
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:poker.someone-already-in-match'),
    });

  const isSomeoneInQueue = await Promise.all(joinedUsers.map(pokerRepository.isUserInQueue));

  if (isSomeoneInQueue.includes(true))
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:poker.someone-already-in-queue'),
    });

  const allUserData = await Promise.all(joinedUsers.map(userRepository.ensureFindUser));

  const chips = DEFAULT_CHIPS;

  if (allUserData.some((a) => chips > a.estrelinhas)) {
    const poorUsers = allUserData.reduce<string[]>(
      (p, c) => (chips > c.estrelinhas ? [...p, c.id] : p),
      [],
    );

    await pokerRepository.removeUsersFromQueue(...poorUsers);

    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:poker.queue.someone-is-poor', {
        stars: chips,
      }),
    });
  }
  await pokerRepository.addUsersInMatch(joinedUsers);

  await starsRepository.batchRemoveStars(joinedUsers, chips);

  // TODO: send a confirm start match to all players, an then start the match
  await ctx.makeMessage({
    embeds: [],
    components: [],
    content: ctx.prettyResponse('hourglass', 'commands:poker.starting-match'),
  });

  setupGame(ctx, joinedUsers, ctx.interaction.message?.embeds?.[0]?.color ?? 0, chips);
};

const executeGlobalPokerRelatedInteractions = async (
  ctx: ComponentInteractionContext,
): Promise<void> => {
  ctx.ack();
  const [action] = ctx.sentData;

  if (action === 'JOIN_QUEUE') return executeJoinQueue(ctx);
};

export { executeGlobalPokerRelatedInteractions };
