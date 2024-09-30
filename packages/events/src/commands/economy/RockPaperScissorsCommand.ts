import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';
import { User } from 'discordeno/transformers';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { createCommand } from '../../structures/command/createCommand';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { mentionUser } from '../../utils/discord/userUtils';
import userRepository from '../../database/repositories/userRepository';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';

const handleInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action] = ctx.sentData;

  if (action === 'CONFIRM') {
    const message = {
      content: ctx.prettyResponse('question', 'commands:pedrapapeltesoura.make-your-choice'),
      components: [
        createActionRow([
          createButton({
            label: ctx.locale('commands:pedrapapeltesoura.rock'),
            customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'ROCK'),
            style: ButtonStyles.Primary,
            emoji: { name: '🪨' },
          }),
          createButton({
            label: ctx.locale('commands:pedrapapeltesoura.paper'),
            customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'PAPER'),
            style: ButtonStyles.Primary,
            emoji: { name: '📄' },
          }),
          createButton({
            label: ctx.locale('commands:pedrapapeltesoura.scissors'),
            customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'SCISSORS'),
            style: ButtonStyles.Primary,
            emoji: { name: '✂️' },
          }),
        ]),
      ],
    };
  }
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
      customId: createCustomId(0, user.id, ctx.originalInteractionId, 'CONFIRM', input ?? false),
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
