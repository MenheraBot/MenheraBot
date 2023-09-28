/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Embed } from 'discordeno/transformers';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { PokerMatch } from './types';
import { mentionUser } from '../../utils/discord/userUtils';
import { closeTable, startNextMatch } from './handleGameAction';
import { logger } from '../../utils/logger';

const joinNextMatch = async (
  ctx: ComponentInteractionContext,
  gameData: PokerMatch,
): Promise<void> => {
  if (gameData.inMatch) return ctx.ack();

  const oldEmbed = ctx.interaction.message?.embeds[0] as Embed;
  const hasNextMatchPlayers = typeof oldEmbed.fields?.[0] !== 'undefined';
  const totalPlayers = Number(oldEmbed.footer!.text.split(' ').pop());

  if (!hasNextMatchPlayers) {
    oldEmbed.fields = [
      {
        name: 'Próxima Partida',
        value: '',
      },
    ];
  }

  if (!oldEmbed.fields![0].value.includes(`${ctx.user.id}`))
    oldEmbed.fields![0].value += `\n:white_check_mark: ${mentionUser(ctx.user.id)}`;

  const alreadyInPlayers = oldEmbed.fields![0].value.split('\n');
  const numberAlreadyInPlayers = hasNextMatchPlayers
    ? alreadyInPlayers.length
    : alreadyInPlayers.length - 1;

  const acceptedPlayers = alreadyInPlayers.filter((a) => a.includes(':white_check_mark:')).length;

  if (numberAlreadyInPlayers === Number(totalPlayers)) {
    if (acceptedPlayers < 2) return closeTable(ctx, gameData);

    const playingIds = alreadyInPlayers.map((a) => a.replace(/\D/g, ''));

    if (numberAlreadyInPlayers !== acceptedPlayers)
      for (let i = 0; i < gameData.players.length; i++) {
        const player = gameData.players[i];

        if (!playingIds.includes(player.id))
          gameData.players.splice(
            gameData.players.findIndex((a) => a.id === player.id),
            1,
          );
      }

    return startNextMatch(ctx, gameData);
  }

  oldEmbed.footer = {
    text: `Aguardando Jogadores: ${numberAlreadyInPlayers} / ${totalPlayers}`,
  };

  ctx.makeMessage({ embeds: [oldEmbed], attachments: [] });
};

const leaveTable = async (
  ctx: ComponentInteractionContext,
  gameData: PokerMatch,
): Promise<void> => {
  if (gameData.inMatch) return ctx.ack();

  const oldEmbed = ctx.interaction.message?.embeds[0] as Embed;
  const nextMatchPlayers = oldEmbed.fields?.[0];
  logger.info(nextMatchPlayers);
};

export { joinNextMatch, leaveTable };
