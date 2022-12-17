import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';

import ComponentInteractionContext from 'structures/command/ComponentInteractionContext';
import starsRepository from '../../database/repositories/starsRepository';
import { postCoinflipMatch } from '../../utils/apiRequests/statistics';
import { randomFromArray } from '../../utils/miscUtils';
import userRepository from '../../database/repositories/userRepository';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { mentionUser } from '../../utils/discord/userUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { createCommand } from '../../structures/command/createCommand';

const confirmCoinflip = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [authorId, input] = ctx.sentData;

  const [userData, authorData] = await Promise.all([
    userRepository.ensureFindUser(ctx.user.id),
    userRepository.ensureFindUser(authorId),
  ]);

  const inputAsNumber = Number(input);

  if (inputAsNumber > userData.estrelinhas) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:coinflip.poor', {
        user: mentionUser(ctx.user.id),
      }),
      components: [],
    });
    return;
  }

  if (inputAsNumber > authorData.estrelinhas) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:coinflip.poor', {
        user: mentionUser(authorId),
      }),
      components: [],
    });
    return;
  }

  const availableOptions = ['cara', 'coroa'];
  const choice = randomFromArray(availableOptions);

  const winner = choice === 'cara' ? authorId : ctx.user.id;
  const loser = choice === 'coroa' ? authorId : ctx.user.id;

  await ctx.makeMessage({
    content: ctx.locale('commands:coinflip.text', {
      choice: ctx.locale(`commands:coinflip.${choice as 'cara'}`),
      value: input,
      winner: mentionUser(winner),
      loser: mentionUser(loser),
    }),
    components: [],
  });

  starsRepository.addStars(winner, inputAsNumber);
  starsRepository.removeStars(loser, inputAsNumber);
  postCoinflipMatch(`${winner}`, `${loser}`, inputAsNumber);
};

const CoinflipCommand = createCommand({
  path: '',
  name: 'coinflip',
  description: '「📀」・Disputa num jogo de Cara e Coroa com um amigo',
  descriptionLocalizations: { 'en-US': '「📀」・Dispute in a coin toss game with a friend' },
  options: [
    {
      name: 'user',
      description: 'Usuário para disputar',
      descriptionLocalizations: { 'en-US': 'User to dispute' },
      type: ApplicationCommandOptionTypes.User,
      required: true,
    },
    {
      name: 'aposta',
      nameLocalizations: { 'en-US': 'bet' },
      description: 'Valor da aposta',
      descriptionLocalizations: { 'en-US': 'Bet ammount' },
      type: ApplicationCommandOptionTypes.Integer,
      required: true,
      minValue: 1,
    },
  ],
  category: 'economy',
  authorDataFields: ['estrelinhas'],
  commandRelatedExecutions: [confirmCoinflip],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', true);
    const input = ctx.getOption<number>('aposta', false, true);

    if (user.toggles.bot)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.bot'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    if (user.id === ctx.author.id)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.self-mention'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    if (input > ctx.authorData.estrelinhas)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.poor', {
            user: mentionUser(ctx.author.id),
          }),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const targetData = await userRepository.ensureFindUser(user.id);

    if (targetData.ban)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.banned-user'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    if (input > targetData.estrelinhas)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.poor', {
            user: mentionUser(user.id),
          }),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const confirmButton = createButton({
      customId: createCustomId(0, user.id, ctx.commandId, ctx.author.id, input),
      label: ctx.locale('commands:coinflip.bet'),
      style: ButtonStyles.Success,
    });

    ctx.makeMessage({
      content: ctx.locale('commands:coinflip.confirm', {
        value: input,
        author: mentionUser(ctx.author.id),
        mention: mentionUser(user.id),
      }),
      components: [createActionRow([confirmButton])],
    });

    finishCommand();
  },
});

export default CoinflipCommand;
