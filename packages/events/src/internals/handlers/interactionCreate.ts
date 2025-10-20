import { Bot, DiscordGatewayPayload, DiscordInteraction } from '@discordeno/bot';

const handleInteractionCreate = (bot: Bot, data: DiscordGatewayPayload): void => {
  bot.events.interactionCreate?.(
    bot.transformers.interaction(bot, data.d as DiscordInteraction),
  );
};

export { handleInteractionCreate };
