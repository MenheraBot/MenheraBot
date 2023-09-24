import { ButtonStyles, SelectOption } from 'discordeno/types';
import userRepository from '../../database/repositories/userRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
} from '../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';
import { PokerMatch, PokerPlayer } from './types';

const showPlayerCards = async (
  ctx: ComponentInteractionContext,
  match: PokerMatch,
  player: PokerPlayer,
): Promise<void> => {
  const image = await vanGoghRequest(VanGoghEndpoints.PokerHand, {
    cards: player.cards,
    theme: player.cardTheme,
  });

  const authorData = await userRepository.ensureFindUser(ctx.user.id);

  const embed = createEmbed({
    title: 'Sua Mão',
    color: hexStringToNumber(authorData.selectedColor),
    image: image.err ? undefined : { url: 'attachment://poker.png' },
  });

  await ctx.respondInteraction({
    embeds: [embed],
    // FIXME: Discord is not accepting this image!
    // file: image.err ? undefined : { name: 'poker.png', blob: image.data },
    flags: MessageFlags.EPHEMERAL,
  });
};

const displayActions = async (
  ctx: ComponentInteractionContext,
  gameData: PokerMatch,
  player: PokerPlayer,
): Promise<void> => {
  const availableActions: SelectOption[] = [
    { label: 'Fold', description: 'Desiste da rodada, e devolva suas cartas', value: 'FOLD' },
  ];

  if (gameData.lastAction.pot === player.pot)
    availableActions.push({
      label: 'Check',
      description: 'Passe a sua vez',
      value: 'CHECK',
    });

  if (player.chips + player.pot > gameData.lastAction.pot) {
    if (gameData.lastAction.pot !== player.pot)
      availableActions.push({
        label: 'Call',
        description: `Aposte ${gameData.lastAction.pot - player.pot} fichas`,
        value: 'CALL',
      });

    availableActions.push({
      label: 'Raise',
      description: 'Aumente a aposta atual',
      value: 'RAISE',
    });
  }

  availableActions.push({
    label: 'All In',
    description: 'Aposte todas suas fichas e torça para dar bom!',
    value: 'ALLIN',
  });

  const seeCardsButton = createButton({
    label: 'Ver Cartas',
    style: ButtonStyles.Primary,
    customId: createCustomId(2, 'N', ctx.commandId, gameData.matchId, 'SEE_CARDS'),
  });

  const makeActionButton = createButton({
    label: 'Apostar',
    style: ButtonStyles.Success,
    disabled: true,
    customId: createCustomId(2, 'N', ctx.commandId, gameData.matchId, 'ACTION'),
  });

  ctx.makeMessage({
    components: [
      createActionRow([seeCardsButton, makeActionButton]),
      createActionRow([
        createSelectMenu({
          customId: createCustomId(2, ctx.user.id, ctx.commandId, gameData.matchId, 'GAME_ACTION'),
          options: availableActions,
          maxValues: 1,
          minValues: 1,
        }),
      ]),
    ],
  });
};

export { showPlayerCards, displayActions };
