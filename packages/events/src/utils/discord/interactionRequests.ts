import {
  ApplicationCommandOptionChoice,
  BigString,
  Interaction,
  InteractionCallbackData,
  InteractionResponse,
  InteractionResponseTypes,
  RestSendRequestOptions,
} from 'discordeno';
import { bot } from '../../index';
import { debugError } from '../debugError';
import { logger } from '../logger';

const sendRequest = async (options: RestSendRequestOptions, currentTry = 1): Promise<void> => {
  try {
    await bot.rest.sendRequest(bot.rest, options);
  } catch (e) {
    logger.error(`[SEND REQUEST] Failed to send request. Current try ${currentTry}`);
    if (currentTry >= 3) throw new Error('Too many failed requests when sending interaction');
    return sendRequest(options, currentTry + 1);
  }
};

const sendInteractionResponse = async (
  interactionId: BigString,
  token: string,
  options: InteractionResponse,
): Promise<void> => {
  const respond = bot.respondInteraction.get(`${interactionId}`);

  if (!respond)
    return sendRequest({
      method: 'POST',
      url: bot.constants.routes.INTERACTION_ID_TOKEN(interactionId, token),
      payload: bot.rest.createRequestBody(bot.rest, {
        method: 'POST',
        body: {
          ...bot.transformers.reverse.interactionResponse(bot, options),
          file: options?.data?.file,
        },
        unauthorized: true,
      }),
    });

  respond(bot.transformers.reverse.interactionResponse(bot, options));
  bot.respondInteraction.delete(`${interactionId}`);
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
        file: options?.file,
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
        file: options?.data?.file,
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
