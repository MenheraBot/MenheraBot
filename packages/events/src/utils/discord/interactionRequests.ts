import {
  ApplicationCommandOptionChoice,
  BigString,
  Interaction,
  InteractionCallbackData,
  InteractionResponse,
  InteractionResponseTypes,
  SendRequestOptions,
} from '@discordeno/bot';
import { bot } from '../../index.js';
import { debugError } from '../debugError.js';
import { logger } from '../logger.js';

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
      url: bot.rest.routes.INTERACTION_ID_TOKEN(interactionId, token),
      payload: bot.rest.createRequestBody(bot.rest, {
        method: 'POST',
        body: {
          ...bot.transformers.interactionCallbackResponse(bot, options),
          files: options?.data?.files,
        },
        unauthorized: true,
      }),
    });

  return new Promise((r) => {
    bot.ackInteraction.set(`${interactionId}`, r);

    respond({
      discord: bot.transformers.reverse.interactionResponse(bot, options),
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
    url: bot.constants.routes.INTERACTION_ORIGINAL_ID_TOKEN(bot.applicationId, token),
    payload: bot.rest.createRequestBody(bot.rest, {
      method: 'PATCH',
      body: {
        ...bot.transformers.reverse.interactionResponse(bot, {
          type: InteractionResponseTypes.UpdateMessage,
          data: options,
        }).data,
        files: options?.files,
      },
      unauthorized: true,
    }),
  });

const sendFollowupMessage = async (token: string, options: InteractionResponse): Promise<void> =>
  sendRequest({
    method: 'POST',
    url: bot.constants.routes.WEBHOOK(bot.applicationId, token),
    payload: bot.rest.createRequestBody(bot.rest, {
      method: 'POST',
      body: {
        ...bot.transformers.reverse.interactionResponse(bot, options).data,
        files: options?.data?.files,
      },
      unauthorized: true,
    }),
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
