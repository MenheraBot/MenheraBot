import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { PokerMatch, PokerPlayer } from './types.js';
import { mentionUser } from '../../utils/discord/userUtils.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { closeTable, startNextMatch } from './matchManager.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import pokerRepository from '../../database/repositories/pokerRepository.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';

const convertChipsToStars = async (gameData: PokerMatch, player: PokerPlayer): Promise<void> => {
  if (!gameData.worthGame) return;

  if (player.chips > 0) starsRepository.addStars(player.id, player.chips);

  if (player.chips > gameData.initialChips)
    postTransaction(
      `${bot.id}`,
      player.id,
      player.chips - gameData.initialChips,
      'estrelinhas',
      ApiTransactionReason.POKER_COMMAND,
    );

  if (player.chips < gameData.initialChips)
    postTransaction(
      player.id,
      `${bot.id}`,
      gameData.initialChips - player.chips,
      'estrelinhas',
      ApiTransactionReason.POKER_COMMAND,
    );
};

const afterLobbyAction = async (
  ctx: ComponentInteractionContext,
  gameData: PokerMatch,
  lobbyAction: string,
): Promise<void> => {
  if (gameData.inMatch) return ctx.ack();

  const oldEmbed = ctx.interaction.message?.embeds?.[0];
  const hasNextMatchPlayers = typeof oldEmbed?.fields?.[0] !== 'undefined';
  const totalPlayers = Number(oldEmbed?.footer!.text.split(' ').pop());

  if (!oldEmbed) throw new Error(`oldEmbed does not exists in afterLobbyAction`);

  if (!hasNextMatchPlayers) {
    oldEmbed.fields = [
      {
        name: ctx.locale('commands:poker.after-lobby.next-match'),
        value: '',
      },
    ];
  }

  const fieldValue = oldEmbed.fields![0].value;

  if (fieldValue.includes(`${ctx.user.id}`)) {
    const splitted = fieldValue.split('\n');
    const line = splitted.findIndex((a) => a.includes(`${ctx.user.id}`));
    const repleceable = splitted[line].includes(':white_check_mark:')
      ? ':white_check_mark:'
      : ':x:';

    const toReplace = `${lobbyAction === 'ENTER' ? ':white_check_mark:' : ':x:'} ${mentionUser(
      ctx.user.id,
    )}`;

    oldEmbed.fields![0].value = fieldValue.replace(
      `${repleceable} ${mentionUser(ctx.user.id)}`,
      toReplace,
    );
  } else
    oldEmbed.fields![0].value += `\n${
      lobbyAction === 'ENTER' ? ':white_check_mark:' : ':x:'
    } ${mentionUser(ctx.user.id)}`;

  const alreadyVottedPlayers = oldEmbed.fields![0].value.split('\n');
  const numberAlreadyVottedPlayers = hasNextMatchPlayers
    ? alreadyVottedPlayers.length
    : alreadyVottedPlayers.length - 1;

  const acceptedPlayers = alreadyVottedPlayers.filter((a) => a.includes(':white_check_mark:'));

  if (numberAlreadyVottedPlayers === Number(totalPlayers)) {
    if (acceptedPlayers.length < 2) return closeTable(ctx, gameData);

    const playingIds = acceptedPlayers.map((a) => a.replace(/\D/g, ''));

    if (numberAlreadyVottedPlayers !== acceptedPlayers.length)
      for (let i = gameData.players.length - 1; i >= 0; i--) {
        const player = gameData.players[i];

        if (!playingIds.includes(player.id)) {
          convertChipsToStars(gameData, player);
          pokerRepository.removeUsersInMatch([player.id]);

          gameData.players.splice(i, 1);

          if (player.id === gameData.masterId) gameData.masterId = gameData.players[0].id;
        }
      }

    return startNextMatch(ctx, gameData);
  }

  oldEmbed.footer = {
    text: ctx.locale('commands:poker.after-lobby.waiting', {
      players: numberAlreadyVottedPlayers,
      maxPlayers: totalPlayers,
    }),
  };

  ctx.makeMessage({
    embeds: [
      createEmbed({
        ...oldEmbed,
        timestamp: oldEmbed.timestamp ? `${oldEmbed.timestamp}` : undefined,
      }),
    ],
    attachments: [],
  });
};

export { afterLobbyAction, convertChipsToStars };
