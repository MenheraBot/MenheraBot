import { createCommand } from '../../structures/command/createCommand';
import {
  createActionRow,
  createCustomId,
  createUsersSelectMenu,
} from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { logger } from '../../utils/logger';
import pokerRepository from '../../database/repositories/pokerRepository';

const a = async (ctx: ComponentInteractionContext): Promise<void> => {
  logger.debug(ctx.interaction.data.resolved);

  ctx.ack();
};

const PokerCommand = createCommand({
  path: '',
  name: 'poker',
  description: '「💳」・Gerencia partidas de poker',
  descriptionLocalizations: { 'en-US': '「💳」・Manage poker matches' },
  category: 'economy',
  authorDataFields: ['estrelinhas'],
  commandRelatedExecutions: [a],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const userInMatch = await pokerRepository.isUserInMatch(ctx.author.id);

    if (userInMatch) return ctx.makeMessage({ content: 'already in match' });

    ctx.makeMessage({
      content: 'Selecione quem vai jogar',
      components: [
        createActionRow([
          createUsersSelectMenu({
            customId: createCustomId(0, ctx.author.id, ctx.commandId),
            maxValues: 8,
          }),
        ]),
      ],
    });
  },
});

export default PokerCommand;
