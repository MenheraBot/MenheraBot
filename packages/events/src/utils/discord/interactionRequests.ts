import {
  ApplicationCommandOptionChoice,
  BigString,
  InteractionCallbackData,
  InteractionResponse,
  InteractionResponseTypes,
  SendRequestOptions,
} from '@discordeno/bot';
import { bot } from '../../index.js';
import { debugError } from '../debugError.js';
import { logger } from '../logger.js';
import { Interaction } from '../../types/discordeno.js';
import { noop } from '../miscUtils.js';

const sendRequest = async (options: SendRequestOptions, currentTry = 1): Promise<void> =>
  new Promise((res, rej): void => {
    try {
      bot.rest.sendRequest({
        ...options,
        resolve: () => res(),
        reject: (err) =>
          debugError(
            new Error(
              err.error ??
                `Error sending interaction: ${err.status} ${err.statusText ?? 'Unknown error'}`,
            ),
            true,
          ),
      });
    } catch (e) {
      logger.error(
        `[SEND REQUEST] Failed to send request to ${options.route}. Current try ${currentTry}`,
      );
      if (currentTry >= 3)
        return rej(new Error('Too many failed requests when sending interaction'));

      setTimeout(() => {
        sendRequest(options, currentTry + 1)
          .then(res)
          .catch(rej);
      }, currentTry * 1000).unref();
    }
  });

const transformInteractionResponseCallbackData = ({ data, type }: InteractionResponse) => ({
  type,
  data: {
    ...data,
    allowedMentions: data?.allowedMentions
      ? bot.transformers.reverse.allowedMentions(bot, data?.allowedMentions)
      : undefined,
    components: data?.components
    // @ts-expect-error BigString conversion
      ? data.components.map((c) => bot.transformers.reverse.component(bot, c))
      : undefined,
    choices: data?.choices
    // @ts-expect-error Snakelize
      ? data.choices.map((c) => bot.transformers.reverse.applicationCommandOptionChoice(bot, c))
      : undefined,
  },
});

const sendInteractionResponse = async (
  interactionId: BigString,
  token: string,
  options: InteractionResponse,
): Promise<void> => {
  const respond = bot.respondInteraction.get(`${interactionId}`);

  if (!respond)
    return sendRequest({
      method: 'POST',
      route: bot.rest.routes.interactions.responses.callback(interactionId, token),
      requestBodyOptions: {
        body: options,
        files: options.data?.files,
        unauthorized: true,
      },
      runThroughQueue: false,
      resolve: noop,
      reject: noop,
      retryCount: 0,
    });

  return new Promise((r) => {
    bot.ackInteraction.set(`${interactionId}`, r);

    respond({
      discord: transformInteractionResponseCallbackData(options),
      id: `${interactionId}`,
    });

    bot.respondInteraction.delete(`${interactionId}`);
  });
};

const editOriginalInteractionResponse = (
  token: string,
  options: InteractionCallbackData,
): Promise<void> =>
  sendRequest({
    method: 'PATCH',
    route: bot.rest.routes.interactions.responses.original(bot.applicationId, token),
    requestBodyOptions: {
      body: options,
      files: options.files,
      unauthorized: true,
    },
    runThroughQueue: false,
    reject: noop,
    resolve: noop,
    retryCount: 0,
  });

const sendFollowupMessage = async (token: string, options: InteractionResponse): Promise<void> =>
  sendRequest({
    method: 'POST',
    route: bot.rest.routes.webhooks.webhook(bot.applicationId, token),
    requestBodyOptions: {
      body: options.data,
      files: options.data?.files,
      unauthorized: true,
    },
    runThroughQueue: false,
    retryCount: 0,
    reject: noop,
    resolve: noop,
  });

const respondWithChoices = (
  interaction: Interaction,
  choices: ApplicationCommandOptionChoice[],
): Promise<void | null> =>
  sendInteractionResponse(interaction.id, interaction.token, {
    type: InteractionResponseTypes.ApplicationCommandAutocompleteResult,
    data: {
      choices,
    },
  }).catch(debugError);

export {
  sendInteractionResponse,
  editOriginalInteractionResponse,
  sendFollowupMessage,
  respondWithChoices,
};
