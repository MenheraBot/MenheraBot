import { ActionRow, ButtonComponent, ButtonStyles } from 'discordeno/types';
import { Embed } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand';
import {
  createActionRow,
  createButton,
  createCustomId,
  createUsersSelectMenu,
} from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import pokerRepository from '../../database/repositories/pokerRepository';
import {
  ModalInteraction,
  SelectMenuInteraction,
  SelectMenuUsersInteraction,
} from '../../types/interaction';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import { mentionUser } from '../../utils/discord/userUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags, removeNonNumbers } from '../../utils/discord/messageUtils';
import { setupGame } from '../../modules/poker/matchManager';
import { showPlayerCards } from '../../modules/poker/playerControl';
import {
  closeTable,
  handleGameAction,
  startNextMatch,
  validateUserBet,
} from '../../modules/poker/handleGameAction';

const gameInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [matchId, action] = ctx.sentData;

  const gameData = await pokerRepository.getPokerMatchState(matchId);

  if (!gameData)
    return ctx.makeMessage({
      content: 'Essa partida não existe mais',
      embeds: [],
      components: [],
      attachments: [],
    });

  if (!gameData.players.map((a) => a.id).includes(`${ctx.user.id}`))
    return ctx.makeMessage({
      content: 'Você não está participando dessa mesa de Poker!',
      flags: MessageFlags.EPHEMERAL,
    });

  const player = gameData.players.find((a) => a.id === `${ctx.user.id}`);

  if (!player)
    return ctx.makeMessage({
      flags: MessageFlags.EPHEMERAL,
      content: 'Você não está mais nesta mesa!',
    });

  switch (action) {
    case 'SEE_CARDS':
      return showPlayerCards(ctx, player);
    case 'CLOSE_TABLE':
      return closeTable(ctx, gameData);
    case 'NEXT_GAME':
      return startNextMatch(ctx, gameData);
    case 'GAME_ACTION':
      return handleGameAction(
        ctx as ComponentInteractionContext<SelectMenuInteraction>,
        gameData,
        player,
      );
    case 'RAISE_BET':
      return validateUserBet(
        ctx as ComponentInteractionContext<ModalInteraction>,
        gameData,
        player,
      );
  }
};

const createStartMatchEmbed = (embedColor: number, alreadyInPlayers: string[]): Embed =>
  createEmbed({
    title: 'Partida de Poker',
    color: embedColor,
    description:
      'Uma partida de poker está se iniciando, os convidados podem entrar na mesa clicando no botão abaixo',
    fields: [
      {
        name: 'Jogadores Participando',
        value: alreadyInPlayers.map(mentionUser).join('\n'),
      },
    ],
  });

const selectPlayers = async (
  ctx: ComponentInteractionContext<SelectMenuUsersInteraction>,
): Promise<void> => {
  const selectedUsers = ctx.interaction.data.resolved.users;
  const selectedUsersIds = ctx.interaction.data.values;

  if (selectedUsers.some((a) => a.toggles.bot))
    return ctx.makeMessage({ content: 'Bots não podem jogar poker!', components: [] });

  if (selectedUsersIds.includes(`${ctx.user.id}`))
    return ctx.makeMessage({
      content: 'Por favor, não escolha a si mesmo para jogar!',
      components: [],
    });

  const isSomeoneBanned = await Promise.all(selectedUsersIds.map(blacklistRepository.isUserBanned));

  if (isSomeoneBanned.includes(true))
    return ctx.makeMessage({
      components: [],
      content:
        'Um dos usuários que você selecionou está banido da Menhera, portanto não pode jogar Poker',
    });

  const isSomeoneInMatch = await Promise.all(selectedUsersIds.map(pokerRepository.isUserInMatch));

  if (isSomeoneInMatch.includes(true))
    return ctx.makeMessage({
      components: [],
      content: 'Um dos usuários que você selecionou já está jogando uma partida de Poker!',
    });

  const embed = createStartMatchEmbed(hexStringToNumber(ctx.sentData[0]), [`${ctx.user.id}`]);

  ctx.makeMessage({
    embeds: [embed],
    allowedMentions: { users: selectedUsersIds.map(BigInt) },
    components: [
      createActionRow([
        createButton({
          label: 'Participar da partida',
          style: ButtonStyles.Primary,
          customId: createCustomId(1, 'N', ctx.commandId, 'JOIN'),
        }),
        createButton({
          label: 'Iniciar Partida',
          style: ButtonStyles.Secondary,
          disabled: true,
          customId: createCustomId(1, ctx.user.id, ctx.commandId, 'START'),
        }),
      ]),
    ],
    content: selectedUsersIds.map(mentionUser).join(', '),
  });
};

const checkStartMatchInteraction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedOption] = ctx.sentData;

  if (selectedOption === 'JOIN') return enterMatch(ctx);

  const joinedUsers = ctx.interaction.message?.embeds?.[0].fields?.[0].value
    .split('\n')
    .map(removeNonNumbers) as string[];

  const isSomeoneInMatch = await Promise.all(joinedUsers.map(pokerRepository.isUserInMatch));

  if (isSomeoneInMatch.includes(true))
    return ctx.makeMessage({
      embeds: [],
      components: [],
      content:
        'Alguém acabou entrando em uma outra partida enquanto esta estava sendo preparada...',
    });

  await pokerRepository.addUsersInMatch(joinedUsers);

  ctx.makeMessage({ embeds: [], components: [], content: 'Iniciando Partida UwU' });

  setupGame(ctx, joinedUsers, ctx.interaction.message?.embeds?.[0]?.color ?? 0);
};

const enterMatch = async (ctx: ComponentInteractionContext): Promise<void> => {
  const allowedUsers = ctx.interaction.message?.content.split(', ').map(removeNonNumbers) ?? [];

  if (!allowedUsers.includes(`${ctx.user.id}`) && ctx.user.id !== ctx.commandAuthor.id)
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: 'Você não está convidado a participar dessa partida!',
    });

  const oldEmbed = ctx.interaction.message?.embeds[0] as Embed;

  const alreadyInPlayers = oldEmbed.fields?.[0].value.split('\n').map(removeNonNumbers) ?? [];

  if (alreadyInPlayers.includes(`${ctx.user.id}`))
    return ctx.respondInteraction({
      content: 'Você já está nessa partida! Aguarde o início dela',
      flags: MessageFlags.EPHEMERAL,
    });

  const oldButton = ctx.interaction.message?.components?.[0].components?.[1] as ButtonComponent;
  oldButton.disabled = false;

  if (alreadyInPlayers.length === allowedUsers.length) oldButton.style = ButtonStyles.Success;

  ctx.makeMessage({
    components: (ctx.interaction.message?.components as ActionRow[]) ?? [],
    embeds: [createStartMatchEmbed(oldEmbed.color ?? 0, [...alreadyInPlayers, `${ctx.user.id}`])],
  });
};

const PokerCommand = createCommand({
  path: '',
  name: 'poker',
  description: '「💳」・Gerencia partidas de poker',
  descriptionLocalizations: { 'en-US': '「💳」・Manage poker matches' },
  category: 'economy',
  authorDataFields: ['estrelinhas'],
  commandRelatedExecutions: [selectPlayers, checkStartMatchInteraction, gameInteractions],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const userInMatch = await pokerRepository.isUserInMatch(ctx.author.id);

    if (userInMatch) return ctx.makeMessage({ content: 'already in match' });

    ctx.makeMessage({
      content: 'Selecione os jogadores dessa partida. Você não deve escolher a si mesmo',
      components: [
        createActionRow([
          createUsersSelectMenu({
            customId: createCustomId(0, ctx.author.id, ctx.commandId, ctx.authorData.selectedColor),
            maxValues: 7,
            placeholder: 'Selecione no máximo 7 pessoas',
          }),
        ]),
      ],
    });
  },
});

export default PokerCommand;
