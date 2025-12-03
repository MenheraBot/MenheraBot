import { Bot, InteractionResponseTypes } from '@discordeno/bot';
import { DiscordInteraction } from '@discordeno/types';

const respondInteraction = (data: DiscordInteraction): string | void => {
  if ([2, 3, 5].includes(data.type))
    return '{"type":4,"data":{"flags": 64,"content":"A Menhera está reiniciando! Espere um pouco. \\n Menhera is rebooting! Wait one moment.","allowed_mentions":{"parse":[]}}}';
};

const respondDevInteraction = (bot: Bot, data: DiscordInteraction): void => {
  bot.helpers.sendInteractionResponse(data.id, data.token, {
    type: InteractionResponseTypes.ChannelMessageWithSource,
    data: {
      flags: 64,
      content:
        'A Menhera está reiniciando! Espere um pouco.\n Menhera is rebooting! Wait a moment.',
      allowedMentions: { parse: [] },
    },
  });
};

export { respondInteraction, respondDevInteraction };
