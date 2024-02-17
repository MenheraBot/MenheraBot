import { createBot, startBot } from 'discordeno';
import { getEnviroments } from './getEnviroments';
import { RequestType, sendEvent } from '.';

const startDevelopmentServices = async (): Promise<void> => {
  const { DEV_BOT_TOKEN } = getEnviroments(['DEV_BOT_TOKEN']);

  // eslint-disable-next-line no-console
  console.log('[GATEWAY] - Starting dev gateway to discord');

  const bot = createBot({
    token: DEV_BOT_TOKEN,
    events: {
      interactionCreate(_, interaction) {
        sendEvent(RequestType.InteractionCreate, interaction);
      },
    },
  });

  await startBot(bot);
};

export { startDevelopmentServices };
