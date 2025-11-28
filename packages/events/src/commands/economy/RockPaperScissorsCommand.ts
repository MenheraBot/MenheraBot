import { ApplicationCommandOptionTypes, ButtonStyles } from '@discordeno/bot';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { MessageFlags } from '@discordeno/bot';
import { mentionUser } from '../../utils/discord/userUtils.js';
import userRepository from '../../database/repositories/userRepository.js';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';
import GenericInteractionContext from '../../structures/command/GenericInteractionContext.js';
import commandRepository from '../../database/repositories/commandRepository.js';
import rockPaperScissorsRepository, {
  RockPaperScissorsGame,
  RockPaperScissorsSelection,
} from '../../database/repositories/rockPaperScissorsRepository.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { postRockPaperScissorsGame } from '../../utils/apiRequests/statistics.js';
import { User } from '../../types/discordeno.js';

const rockPaperScissors = (
  game: RockPaperScissorsGame,
): {
  winner: [string, RockPaperScissorsSelection];
  loser: [string, RockPaperScissorsSelection];
  draw: boolean;
} => {
  const [firstUser, secondUser] = Object.entries(game).filter(([key]) => key !== 'betValue');

  if (firstUser[1] === secondUser[1]) return { winner: firstUser, loser: secondUser, draw: true };

  const winningCombinations: Record<RockPaperScissorsSelection, RockPaperScissorsSelection> = {
    ROCK: 'SCISSORS',
    PAPER: 'ROCK',
    SCISSORS: 'PAPER',
  };

  if (winningCombinations[firstUser[1]] === secondUser[1])
    return { winner: firstUser, loser: secondUser, draw: false };

  return { winner: secondUser, loser: firstUser, draw: false };
};

const handleInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, betValue, selection, color] = ctx.sentData as [
    'CONFIRM' | 'SELECT',
    string,
    RockPaperScissorsSelection,
    string,
  ];

  if (action === 'CONFIRM') {
    const message = {
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('question', 'commands:pedrapapeltesoura.make-your-choice'),
      components: [
        createActionRow([
          createButton({
            label: ctx.locale('commands:pedrapapeltesoura.rock'),
            customId: createCustomId(
              0,
              'N',
              ctx.originalInteractionId,
              'SELECT',
              betValue,
              'ROCK',
              color,
            ),
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
              color,
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
              color,
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
      originalInteraction.originalInteractionId,
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

  await rockPaperScissorsRepository.deleteMatch(ctx.originalInteractionId);

  const originalInteraction = await commandRepository.getOriginalInteraction(
    ctx.originalInteractionId,
  );

  if (!originalInteraction)
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.interaction-lost'),
    });

  const gameResults = rockPaperScissors(gameData);
  const { winner, loser, draw } = gameResults;
  const parsedBet = Number(betValue);

  const winnerSelected = winner[1].toLowerCase() as Lowercase<RockPaperScissorsSelection>;
  const loserSelected = loser[1].toLowerCase() as Lowercase<RockPaperScissorsSelection>;

  const originalInteractionContext = new GenericInteractionContext(
    originalInteraction.originalInteractionToken,
    originalInteraction.originalInteractionId,
    originalInteraction.locale,
  );

  if (parsedBet > 0 && !draw) {
    const [firstUserData, secondUserData] = await Promise.all([
      userRepository.ensureFindUser(winner[0]),
      userRepository.ensureFindUser(loser[0]),
    ]);

    if (firstUserData.estrelinhas < parsedBet || secondUserData.estrelinhas < parsedBet)
      return originalInteractionContext.makeMessage({
        components: [],
        content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.someone-poor'),
      });

    await rockPaperScissorsRepository.applyBets(winner[0], loser[0], parsedBet);
  }

  const embed = createEmbed({
    color: hexStringToNumber(color),
    title: ctx.locale('commands:pedrapapeltesoura.results-title'),
    description: ctx.locale(`commands:pedrapapeltesoura.${draw ? 'result-draw' : 'results'}`, {
      winner: mentionUser(winner[0]),
      loser: mentionUser(loser[0]),
    }),
    fields: [
      {
        name: ' ',
        value: ctx.prettyResponse(winnerSelected, 'commands:pedrapapeltesoura.user-choice', {
          user: mentionUser(winner[0]),
          choice: ctx.locale(`commands:pedrapapeltesoura.${winnerSelected}`),
        }),
        inline: true,
      },
      {
        name: ' ',
        value: ctx.prettyResponse(loserSelected, 'commands:pedrapapeltesoura.user-choice', {
          user: mentionUser(loser[0]),
          choice: ctx.locale(`commands:pedrapapeltesoura.${loserSelected}`),
        }),
        inline: true,
      },
    ],
    footer:
      parsedBet > 0
        ? { text: ctx.locale('commands:pedrapapeltesoura.results-footer', { betValue }) }
        : undefined,
  });

  await originalInteractionContext.makeMessage({ content: '', components: [], embeds: [embed] });

  await postRockPaperScissorsGame(
    [
      { id: winner[0], selected: winnerSelected, won: !draw },
      { id: loser[0], selected: loserSelected, won: false },
    ],
    draw,
    parsedBet,
  );
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
        flags: MessageFlags.Ephemeral,
      });

    if (user.bot)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.bot', {
          user: mentionUser(ctx.user.id),
          amount: input,
        }),
        flags: MessageFlags.Ephemeral,
      });

    if (input && input > ctx.authorData.estrelinhas)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.poor', {
          user: mentionUser(ctx.user.id),
          amount: input,
        }),
        flags: MessageFlags.Ephemeral,
      });

    const targetData = await userRepository.ensureFindUser(user.id);

    if (targetData.ban)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.banned-user'),
        flags: MessageFlags.Ephemeral,
      });

    if (input && input > targetData.estrelinhas)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:pedrapapeltesoura.poor', {
          user: mentionUser(user.id),
          amount: input,
        }),
        flags: MessageFlags.Ephemeral,
      });

    const confirmButton = createButton({
      customId: createCustomId(
        0,
        user.id,
        ctx.originalInteractionId,
        'CONFIRM',
        input ?? 0,
        'N',
        ctx.authorData.selectedColor,
      ),
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
