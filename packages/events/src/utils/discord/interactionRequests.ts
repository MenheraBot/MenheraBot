import {
  BigString,
  InteractionCallbackData,
  InteractionResponse,
  InteractionResponseTypes,
} from 'discordeno';
import { bot } from '../../index';

const sendInteractionResponse = async (
  interactionId: BigString,
  token: string,
  options: InteractionResponse,
): Promise<void> =>
  bot.rest.sendRequest(bot.rest, {
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

const editOriginalInteractionResponse = async (
  token: string,
  options: InteractionCallbackData,
): Promise<void> =>
  bot.rest.sendRequest(bot.rest, {
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
  bot.rest.sendRequest(bot.rest, {
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

export { sendInteractionResponse, editOriginalInteractionResponse, sendFollowupMessage };
