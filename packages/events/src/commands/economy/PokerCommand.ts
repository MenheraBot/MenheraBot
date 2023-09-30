import {
  ActionRow,
  ApplicationCommandOptionTypes,
  ButtonComponent,
  ButtonStyles,
} from 'discordeno/types';
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
import { mentionUser } from '../../utils/discord/userUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags, removeNonNumbers } from '../../utils/discord/messageUtils';
import { setupGame } from '../../modules/poker/matchManager';
import {
  executeMasterAction,
  forceRemovePlayers,
  showPlayerCards,
} from '../../modules/poker/playerControl';
import {
  closeTable,
  handleGameAction,
  validateUserBet,
} from '../../modules/poker/handleGameAction';
import { afterLobbyAction } from '../../modules/poker/afterMatchLobby';
import userRepository from '../../database/repositories/userRepository';
import starsRepository from '../../database/repositories/starsRepository';

const gameInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [matchId, action, lobbyAction] = ctx.sentData;

  const gameData = await pokerRepository.getMatchState(matchId);

  if (!gameData)
    return ctx.makeMessage({
      content: 'Essa partida não existe mais',
      embeds: [],
      components: [],
      attachments: [],
    });

  if (!gameData.players.map((a) => a.id).includes(`${ctx.user.id}`))
    return ctx.respondInteraction({
      content: 'Você não está participando dessa mesa de Poker!',
      flags: MessageFlags.EPHEMERAL,
    });

  const player = gameData.players.find((a) => a.id === `${ctx.user.id}`);

  if (!player)
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: 'Você não está mais nesta mesa!',
    });

  switch (action) {
    case 'SEE_CARDS':
      return showPlayerCards(ctx, player);
    case 'CLOSE_TABLE':
      return closeTable(ctx, gameData);
    case 'ADMIN_CONTROL':
      return executeMasterAction(ctx, gameData);
    case 'REMOVE_PLAYERS':
      return forceRemovePlayers(
        ctx as ComponentInteractionContext<SelectMenuUsersInteraction>,
        gameData,
      );
    case 'AFTER_LOBBY':
      return afterLobbyAction(ctx, gameData, lobbyAction);
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

  const isSomeoneInMatch = await Promise.all(selectedUsersIds.map(pokerRepository.isUserInMatch));

  if (isSomeoneInMatch.includes(true))
    return ctx.makeMessage({
      components: [],
      content: 'Um dos usuários que você selecionou já está jogando uma partida de Poker!',
    });

  const allUserData = await Promise.all(selectedUsersIds.map(userRepository.ensureFindUser));

  if (allUserData.some((a) => a.ban))
    return ctx.makeMessage({
      components: [],
      content:
        'Um dos usuários que você selecionou está banido da Menhera, portanto não pode jogar Poker',
    });

  const [embedColor, stringedChips] = ctx.sentData;
  const chips = Number(stringedChips);

  if (allUserData.some((a) => chips > a.estrelinhas))
    return ctx.makeMessage({
      components: [],
      content:
        'Um dos usuários que você selecionou não tem estrelinhas suficientes para apostar nesta partida',
    });

  const embed = createStartMatchEmbed(hexStringToNumber(embedColor), [`${ctx.user.id}`]);

  ctx.makeMessage({
    embeds: [embed],
    allowedMentions: { users: selectedUsersIds.map(BigInt) },
    components: [
      createActionRow([
        createButton({
          label: 'Participar da partida',
          style: ButtonStyles.Primary,
          customId: createCustomId(1, 'N', ctx.commandId, 'JOIN', chips),
        }),
        createButton({
          label: 'Iniciar Partida',
          style: ButtonStyles.Secondary,
          disabled: true,
          customId: createCustomId(1, ctx.user.id, ctx.commandId, 'START', chips),
        }),
      ]),
    ],
    content: selectedUsersIds.map(mentionUser).join(', '),
  });
};

const checkStartMatchInteraction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedOption, stringedChips] = ctx.sentData;
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

  const allUserData = await Promise.all(joinedUsers.map(userRepository.ensureFindUser));

  const chips = Number(stringedChips);

  if (allUserData.some((a) => chips > a.estrelinhas))
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content:
        'Um dos usuários que você selecionou não tem estrelinhas suficientes para apostar nesta partida',
    });

  await pokerRepository.addUsersInMatch(joinedUsers);

  if (chips > 0)
    joinedUsers.forEach((user) => {
      starsRepository.removeStars(user, chips);
    });

  ctx.makeMessage({ embeds: [], components: [], content: 'Iniciando Partida UwU' });

  setupGame(ctx, joinedUsers, ctx.interaction.message?.embeds?.[0]?.color ?? 0, chips);
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

  const [, stringedChips] = ctx.sentData;
  const chips = Number(stringedChips);

  if (chips > 0) {
    const userData = await userRepository.ensureFindUser(ctx.user.id);

    if (chips > userData.estrelinhas)
      return ctx.makeMessage({
        content: 'Você não tem todas essas estrelinhas para entrar nessa partida',
      });
  }

  const oldButton = ctx.interaction.message?.components?.[0].components?.[1] as ButtonComponent;
  oldButton.disabled = false;

  if (alreadyInPlayers.length === allowedUsers.length) {
    (ctx.interaction.message?.components?.[0].components?.[0] as ButtonComponent).disabled = true;
    oldButton.style = ButtonStyles.Success;
  }

  ctx.makeMessage({
    components: (ctx.interaction.message?.components as ActionRow[]) ?? [],
    embeds: [createStartMatchEmbed(oldEmbed.color ?? 0, [...alreadyInPlayers, `${ctx.user.id}`])],
  });
};

const PokerCommand = createCommand({
  path: '',
  name: 'poker',
  description: '「💰」・Inicie uma partida de Poker',
  descriptionLocalizations: { 'en-US': '「💰」・Start a Poker match' },
  category: 'economy',
  options: [
    {
      name: 'fichas',
      description: 'Quantas fichas cada jogador vai levar para partida',
      type: ApplicationCommandOptionTypes.Integer,
      minValue: 10_000,
      nameLocalizations: {
        'en-US': 'chips',
      },
      descriptionLocalizations: {
        'en-US': 'How many chips each player will take to the match',
      },
      required: false,
    },
  ],
  authorDataFields: ['estrelinhas'],
  commandRelatedExecutions: [selectPlayers, checkStartMatchInteraction, gameInteractions],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const fichas = ctx.getOption<number>('fichas', false) ?? 0;

    if (fichas > ctx.authorData.estrelinhas)
      return ctx.makeMessage({
        content: 'Você não possui todas essas estrelinhas para apostar em uma partida de Poker!',
      });

    const userInMatch = await pokerRepository.isUserInMatch(ctx.author.id);

    if (userInMatch) return ctx.makeMessage({ content: 'already in match' });

    ctx.makeMessage({
      content: 'Selecione os jogadores dessa partida. Você não deve escolher a si mesmo',
      components: [
        createActionRow([
          createUsersSelectMenu({
            customId: createCustomId(
              0,
              ctx.author.id,
              ctx.commandId,
              ctx.authorData.selectedColor,
              fichas,
            ),
            maxValues: 7,
            placeholder: 'Selecione no máximo 7 pessoas',
          }),
        ]),
      ],
    });
  },
});

export default PokerCommand;
