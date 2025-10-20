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

const sendRequest = async (options: SendRequestOptions, currentTry = 1): Promise<void> =>
  new Promise((res, rej): void => {
    try {
      bot.rest.sendRequest(options).then(() => {
        res();
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
      resolve: () => undefined,
      reject: () => undefined,
      retryCount: 0,
    });

  return new Promise((r) => {
    bot.ackInteraction.set(`${interactionId}`, r);

    respond({
      // FIXME: This is not working, but i think this entire file is not working as well
      // @ts-expect-error
      discord: bot.transformers.interactionCallbackResponse(bot, options),
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
    reject: () => undefined,
    resolve: () => undefined,
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
    reject: () => undefined,
    resolve: () => undefined,
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
