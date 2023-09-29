/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SelectMenuComponent, SelectOption } from 'discordeno/types';
import userRepository from '../../database/repositories/userRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
  createUsersSelectMenu,
} from '../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';
import { PokerMatch, PokerPlayer } from './types';
import { InteractionContext } from '../../types/menhera';
import { SelectMenuUsersInteraction } from '../../types/interaction';
import pokerRepository from '../../database/repositories/pokerRepository';
import { mentionUser } from '../../utils/discord/userUtils';

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

const forceRemovePlayers = async (
  ctx: ComponentInteractionContext<SelectMenuUsersInteraction>,
  gameData: PokerMatch,
): Promise<void> => {
  if (!gameData.inMatch)
    return ctx.makeMessage({
      components: [],
      content: 'Você não pode controlar jogadores enquanto a partida não está acontecendo',
    });

  const selectedPlayers = ctx.interaction.data.resolved.users;

  gameData.players.forEach((a) => {
    a.willExit = !selectedPlayers.has(BigInt(a.id));
  });

  await pokerRepository.setMatchState(gameData.matchId, gameData);

  ctx.makeMessage({
    components: [],
    content: `Os jogadores ${gameData.players
      .filter((a) => a.willExit)
      .map((a) => mentionUser(a.id))
      .join(' ,')} foram marcados para sair da partida ao fim dessa rodada.`,
  });
};

const executeMasterAction = async (
  ctx: ComponentInteractionContext,
  gameData: PokerMatch,
): Promise<void> => {
  if (!gameData.inMatch)
    return ctx.respondInteraction({
      content: 'Você não pode controlar jogadores enquanto a partida não está acontecendo',
      flags: MessageFlags.EPHEMERAL,
    });

  const ingamePlayers = createUsersSelectMenu({
    customId: createCustomId(
      2,
      gameData.masterId,
      ctx.commandId,
      gameData.matchId,
      'REMOVE_PLAYERS',
    ),
    defaultValues: gameData.players.reduce<{ id: string; type: 'user' }[]>((p, c) => {
      if (c.willExit) return p;
      p.push({ id: c.id, type: 'user' });
      return p;
    }, []),
    minValues: 0,
    placeholder: 'Jogadores na partida',
    maxValues: gameData.players.length,
  });

  ctx.respondInteraction({
    components: [createActionRow([ingamePlayers])],
    content:
      'Abaixo estão os jogadores da partida atualmente. Retire a seleção de quem você quer remover da partida',
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

  if (gameData.lastAction.pot === player.pot) {
    availableActions.push({
      label: 'Check',
      description: 'Passe a sua vez',
      value: 'CHECK',
    });

    if (player.chips > gameData.blind)
      availableActions.push({
        label: `Bet ${gameData.blind}`,
        description: `Faça uma aposta de ${gameData.blind} fichas`,
        value: `BET | ${gameData.blind}`,
      });
  }

  if (player.chips + player.pot > gameData.lastAction.pot) {
    const toRaise = (gameData.lastAction.pot - player.pot) * 2;

    if (gameData.lastAction.pot !== player.pot) {
      availableActions.push({
        label: 'Call',
        description: `Aposte ${gameData.lastAction.pot - player.pot} fichas`,
        value: `CALL | ${gameData.lastAction.pot - player.pot}`,
      });

      if (player.chips >= toRaise && gameData.raises < 2)
        availableActions.push({
          label: `Raise ${toRaise}`,
          description: 'Dobre a aposta atual',
          value: `RAISE | ${toRaise}`,
        });
    }

    if (player.chips > toRaise && gameData.raises < 2)
      availableActions.push({
        label: `Raise`,
        description: 'Aumente a aposta atual em um valor',
        value: 'RAISE | CUSTOM',
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
    placeholder: `${player.name}, escolha sua próxima ação`,
  });
};

export { showPlayerCards, getAvailableActions, executeMasterAction, forceRemovePlayers };
