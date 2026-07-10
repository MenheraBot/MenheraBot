import { MessageFlags } from '@discordeno/bot';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { createContainer, createTextDisplay } from '../../utils/discord/componentUtils.js';
import { DatabaseFarmerSchema } from '../../types/database.js';

const initTutorial = (ctx: ChatInputInteractionContext, farmer: DatabaseFarmerSchema) => {
  return ctx.makeLayoutMessage({
    components: [
      createContainer({
        accentColor: ctx.userColor,
        components: [createTextDisplay(`## ${ctx.locale('commands:fazendinha.tutorial.title')}`)],
      }),
    ],
    flags: MessageFlags.Ephemeral,
  });
};

export { initTutorial };
