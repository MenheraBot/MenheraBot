import { logger } from './logger';
import { MenheraClient } from '../types/menhera';
import { createEmbed } from './discord/embedUtils';
import { getEnviroments } from './getEnviroments';
import { getStuckQueuesCounter } from '../structures/initializePrometheus';
import { debugError } from './debugError';

const { ERROR_WEBHOOK_ID, ERROR_WEBHOOK_TOKEN } = getEnviroments([
  'ERROR_WEBHOOK_ID',
  'ERROR_WEBHOOK_TOKEN',
]);

const freeStuckQueues = (bot: MenheraClient): void => {
  setInterval(() => {
    bot.rest.pathQueues.forEach((queue, path) => {
      if (
        queue.remaining === 0 &&
        queue.waiting.length > 0 &&
        !queue.processPending &&
        queue.processing
      ) {
        logger.info(
          `[STUCK QUEUE] - Detected a stuck queue in ${path}. There are ${queue.waiting.length} requets waiting. Clearing UP!`,
        );
        queue.remaining = 1;

        if (!process.env.NOMICROSERVICES) getStuckQueuesCounter().inc(0.5);

        const embed = createEmbed({
          color: 0xf08c18,
          title: 'Stuck Queue',
          description: `Detected a stuck queue in ${path}. There are ${queue.waiting.length} requets waiting`,
          timestamp: Date.now(),
        });

        bot.helpers
          .sendWebhookMessage(BigInt(ERROR_WEBHOOK_ID), ERROR_WEBHOOK_TOKEN, {
            embeds: [embed],
            content: `<@${bot.ownerId}>`,
            allowedMentions: { users: [bot.ownerId] },
          })
          .catch(debugError);
      }
    });
  }, 1000);
};

export { freeStuckQueues };
