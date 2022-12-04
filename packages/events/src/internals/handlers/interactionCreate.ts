import { Bot, DiscordGatewayPayload, DiscordInteraction } from 'discordeno';

const handleInteractionCreate = (bot: Bot, data: DiscordGatewayPayload): void => {
  bot.events.interactionCreate(
    bot,
    bot.transformers.interaction(bot, data.d as DiscordInteraction),
  );
};

export { handleInteractionCreate };
