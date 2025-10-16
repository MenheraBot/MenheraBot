import { logger } from './logger.js';
import { MenheraClient } from '../types/menhera.js';
import { createEmbed } from './discord/embedUtils.js';
import { getEnviroments } from './getEnviroments.js';
import { getStuckQueuesCounter } from '../structures/initializePrometheus.js';
import { debugError } from './debugError.js';

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
        !queue.processingPending &&
        queue.processing
      ) {
        logger.info(
          `[STUCK QUEUE] - Detected a stuck queue in ${path}. There are ${queue.waiting.length} requets waiting. Clearing UP!`,
        );
        queue.remaining = 1;

        if (!process.env.NOMICROSERVICES) getStuckQueuesCounter().inc(1);

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
  }, 2_500);
};

export { freeStuckQueues };
