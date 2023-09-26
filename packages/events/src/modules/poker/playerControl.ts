/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SelectMenuComponent, SelectOption } from 'discordeno/types';
import userRepository from '../../database/repositories/userRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { createCustomId, createSelectMenu } from '../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';
import { PokerMatch, PokerPlayer } from './types';
import { InteractionContext } from '../../types/menhera';

const showPlayerCards = async (
  ctx: ComponentInteractionContext,
  player: PokerPlayer,
): Promise<void> => {
  await ctx.visibleAck(true);

  const image = await vanGoghRequest(VanGoghEndpoints.PokerHand, {
    cards: player.cards,
    theme: player.cardTheme,
  });

  const authorData = await userRepository.ensureFindUser(ctx.user.id);

  const embed = createEmbed({
    title: 'Sua Mão',
    footer: player.folded ? { text: 'Você não está mais participando desta rodada!' } : undefined,
    color: hexStringToNumber(authorData.selectedColor),
    image: image.err ? undefined : { url: 'attachment://poker.png' },
  });

  await ctx.makeMessage({
    embeds: [embed],
    file: image.err ? undefined : { name: 'poker.png', blob: image.data },
    flags: MessageFlags.EPHEMERAL,
  });
};

const getAvailableActions = (
  ctx: InteractionContext,
  gameData: PokerMatch,
): SelectMenuComponent => {
  const player = gameData.players.find((p) => p.seatId === gameData.seatToPlay)!;

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

  return createSelectMenu({
    customId: createCustomId(2, player.id, ctx.commandId, gameData.matchId, 'GAME_ACTION'),
    options: availableActions,
    maxValues: 1,
    minValues: 1,
  });
};

export { showPlayerCards, getAvailableActions };
