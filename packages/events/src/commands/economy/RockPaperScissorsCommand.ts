import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';
import { User } from 'discordeno/transformers';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { createCommand } from '../../structures/command/createCommand';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { mentionUser } from '../../utils/discord/userUtils';
import userRepository from '../../database/repositories/userRepository';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import GenericInteractionContext from '../../structures/command/GenericInteractionContext';
import commandRepository from '../../database/repositories/commandRepository';
import rockPaperScissorsRepository, {
  RockPaperScissorsGame,
  RockPaperScissorsSelection,
} from '../../database/repositories/rockPaperScissorsRepository';

const rockPaperScissors = (
  game: RockPaperScissorsGame,
):
  | {
      winner: [string, RockPaperScissorsSelection];
      loser: [string, RockPaperScissorsSelection];
    }
  | false => {
  const [firstUser, secondUser] = Object.entries(game).filter(([key]) => key !== 'betValue');

  if (firstUser[1] === secondUser[1]) return false;

  const winningCombinations: { [key in RockPaperScissorsSelection]: RockPaperScissorsSelection } = {
    ROCK: 'SCISSORS',
    PAPER: 'ROCK',
    SCISSORS: 'PAPER',
  };

  if (winningCombinations[firstUser[1]] === secondUser[1])
    return { winner: firstUser, loser: secondUser };

  return { winner: secondUser, loser: firstUser };
};

const handleInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, betValue, selection] = ctx.sentData as [
    'CONFIRM' | 'SELECT',
    string,
    RockPaperScissorsSelection,
  ];

  if (action === 'CONFIRM') {
    const message = {
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('question', 'commands:pedrapapeltesoura.make-your-choice'),
      components: [
        createActionRow([
          createButton({
            label: ctx.locale('commands:pedrapapeltesoura.rock'),
            customId: createCustomId(0, 'N', ctx.originalInteractionId, 'SELECT', betValue, 'ROCK'),
            style: ButtonStyles.Primary,
            emoji: { name: '🪨' },
          }),
          createButton({
            label: ctx.locale('commands:pedrapapeltesoura.paper'),
            customId: createCustomId(
              0,
              'N',
              ctx.originalInteractionId,
              'SELECT',
              betValue,
              'PAPER',
            ),
            style: ButtonStyles.Primary,
            emoji: { name: '📄' },
          }),
          createButton({
            label: ctx.locale('commands:pedrapapeltesoura.scissors'),
            customId: createCustomId(
              0,
              'N',
              ctx.originalInteractionId,
              'SELECT',
              betValue,
              'SCISSORS',
            ),
            style: ButtonStyles.Primary,
            emoji: { name: '✂️' },
          }),
        ]),
      ],
    };

    const originalInteraction = await commandRepository.getOriginalInteraction(
      ctx.originalInteractionId,
    );

    if (!originalInteraction)
      return ctx.makeMessage({
        components: [],
        content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.interaction-lost'),
      });

    const authorMessage = new GenericInteractionContext(
      originalInteraction.originalInteractionToken,
      originalInteraction.locale,
    );

    await rockPaperScissorsRepository.setupGame(ctx.originalInteractionId, Number(betValue));

    await ctx.makeMessage({
      content: ctx.prettyResponse('hourglass', 'commands:pedrapapeltesoura.waiting'),
      components: [],
    });

    await Promise.all([authorMessage.followUp(message), ctx.followUp(message)]);
    return;
  }

  await rockPaperScissorsRepository.registerSelection(
    ctx.originalInteractionId,
    ctx.user.id,
    selection,
  );

  const gameData = await rockPaperScissorsRepository.getMatchData(ctx.originalInteractionId);
  await ctx.makeMessage({ components: [], content: ctx.safeEmoji('ok') });

  if (Object.keys(gameData).length < 3) return;

  const originalInteraction = await commandRepository.getOriginalInteraction(
    ctx.originalInteractionId,
  );

  if (!originalInteraction)
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.interaction-lost'),
    });

  const gameFinished = rockPaperScissors(gameData);

  const originalInteractionContext = new GenericInteractionContext(
    originalInteraction.originalInteractionToken,
    originalInteraction.locale,
  );

  if (!gameFinished) {
    originalInteractionContext.makeMessage({ content: 'Foi um empate' });

    await rockPaperScissorsRepository.deleteMatch(ctx.originalInteractionId);
    return;
  }

  originalInteractionContext.makeMessage({
    content: `o vencedor foi ${mentionUser(gameFinished.winner[0])} que escolheu ${
      gameFinished.winner[1]
    }\n\nValeu ao perdedor ${mentionUser(gameFinished.loser[0])} que escolheu ${
      gameFinished.loser[1]
    }`,
  });

  await rockPaperScissorsRepository.deleteMatch(ctx.originalInteractionId);
};

const RockPaperScissorsCommand = createCommand({
  path: '',
  name: 'pedra',
  nameLocalizations: { 'en-US': 'rock' },
  description: '「🪨」・Disputa Pedra Papel e Tesoura com alguém',
  descriptionLocalizations: {
    'en-US': '「🪨」・Play Rock Paper Scissors with someone',
  },
  options: [
    {
      name: 'papel',
      nameLocalizations: { 'en-US': 'paper' },
      description: '「📄」・Disputa Pedra Papel e Tesoura com alguém',
      descriptionLocalizations: {
        'en-US': '「📄」・Play Rock Paper Scissors with someone',
      },
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      options: [
        {
          name: 'tesoura',
          nameLocalizations: { 'en-US': 'scissors' },
          description: '「✂️」・Disputa Pedra Papel e Tesoura com alguém',
          descriptionLocalizations: {
            'en-US': '「✂️」・Play Rock Paper Scissors with someone',
          },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              type: ApplicationCommandOptionTypes.User,
              name: 'oponente',
              nameLocalizations: { 'en-US': 'opponent' },
              description: 'Oponente para disputar',
              descriptionLocalizations: { 'en-US': 'Opponent to compete' },
              required: true,
            },
            {
              type: ApplicationCommandOptionTypes.Integer,
              name: 'aposta',
              nameLocalizations: { 'en-US': 'bet' },
              description: 'Valor da aposta',
              descriptionLocalizations: { 'en-US': 'Bet ammount' },
              required: false,
              minValue: 1,
            },
          ],
        },
      ],
    },
  ],
  category: 'economy',
  authorDataFields: ['estrelinhas', 'selectedColor'],
  commandRelatedExecutions: [handleInteractions],
  execute: async (ctx) => {
    const user = ctx.getOption<User>('oponente', 'users', true);
    const input = ctx.getOption<number>('aposta', false, false);

    if (user.id === ctx.user.id)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.self-mention'),
        flags: MessageFlags.EPHEMERAL,
      });

    if (input && input > ctx.authorData.estrelinhas)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.poor', {
          user: mentionUser(ctx.user.id),
          amount: input,
        }),
        flags: MessageFlags.EPHEMERAL,
      });

    const targetData = await userRepository.ensureFindUser(user.id);

    if (targetData.ban)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.banned-user'),
        flags: MessageFlags.EPHEMERAL,
      });

    if (input && input > targetData.estrelinhas)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.poor', {
          user: mentionUser(user.id),
          amount: input,
        }),
        flags: MessageFlags.EPHEMERAL,
      });

    const confirmButton = createButton({
      customId: createCustomId(0, user.id, ctx.originalInteractionId, 'CONFIRM', input ?? 0),
      label: ctx.locale('commands:pedrapapeltesoura.confirm-button'),
      style: ButtonStyles.Success,
    });

    ctx.makeMessage({
      content: ctx.locale(
        `commands:pedrapapeltesoura.confirm-game-${input ? 'official' : 'friendly'}`,
        {
          author: mentionUser(ctx.user.id),
          user: mentionUser(user.id),
          amount: input,
        },
      ),
      allowedMentions: { users: [user.id] },
      components: [createActionRow([confirmButton])],
    });
  },
});

export default RockPaperScissorsCommand;
