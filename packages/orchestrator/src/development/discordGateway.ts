import { DiscordInteraction } from 'discordeno/types';
import { RequestType, sendEvent } from '..';

type ToSendInteraction = { body: DiscordInteraction };

const startGateway = async (): Promise<void> => {
  const eventData: ToSendInteraction = { body: {} };

  sendEvent(RequestType.InteractionCreate, eventData);
};
export { startGateway };
