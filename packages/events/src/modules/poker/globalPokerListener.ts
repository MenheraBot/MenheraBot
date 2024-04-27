import pokerRepository from '../../database/repositories/pokerRepository';
import starsRepository from '../../database/repositories/starsRepository';
import userRepository from '../../database/repositories/userRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { minutesToMillis } from '../../utils/miscUtils';
import GlobalMatchFollowupInteraction from './GlobalMatchFollowupInteraction';
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

    await pokerRepository.addUserToQueue(ctx.user.id, ctx.interaction.token);

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

  const userTokens = await pokerRepository.getInteractionTokens(joinedUsers);

  const globalContext = new GlobalMatchFollowupInteraction(
    userTokens,
    `${ctx.commandId}`,
    ctx.i18n,
  );

  ctx.makeMessage({
    embeds: [],
    components: [],
    flags: MessageFlags.EPHEMERAL,
    content: ctx.prettyResponse('hourglass', 'commands:poker.starting-match'),
  });

  globalContext.followUp({
    content: ctx.prettyResponse('hourglass', 'commands:poker.starting-match'),
  });

  setupGame(
    ctx,
    joinedUsers,
    ctx.interaction.message?.embeds?.[0]?.color ?? 0,
    chips,
    `${ctx.interaction.id}`,
    'GLOBAL',
    ctx.guildLocale,
  );
};

const executeGlobalPokerRelatedInteractions = async (
  ctx: ComponentInteractionContext,
): Promise<void> => {
  ctx.ack();
  const [action] = ctx.sentData;

  if (action === 'JOIN_QUEUE') return executeJoinQueue(ctx);
};

export { executeGlobalPokerRelatedInteractions };
