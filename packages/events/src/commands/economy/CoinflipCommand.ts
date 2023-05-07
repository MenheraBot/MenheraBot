import { User } from 'discordeno/transformers';
import {
  AllowedMentionsTypes,
  ApplicationCommandOptionTypes,
  ButtonStyles,
} from 'discordeno/types';

import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { postCoinflipMatch } from '../../utils/apiRequests/statistics';
import { negate, randomFromArray } from '../../utils/miscUtils';
import userRepository from '../../database/repositories/userRepository';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { mentionUser } from '../../utils/discord/userUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { createCommand } from '../../structures/command/createCommand';
import { EMOJIS, transactionableCommandOption } from '../../structures/constants';
import { huntValues } from '../../modules/shop/constants';

const confirmCoinflip = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [input, currency] = ctx.sentData as [
    string,
    typeof transactionableCommandOption[number]['value'],
  ];

  const [userData, authorData] = await Promise.all([
    userRepository.ensureFindUser(ctx.user.id),
    userRepository.ensureFindUser(ctx.commandAuthor.id),
  ]);

  const inputAsNumber = Number(input);

  if (inputAsNumber > userData[currency])
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:coinflip.poor', {
        user: mentionUser(ctx.user.id),
        currency: ctx.locale(`common:${currency}`),
        amount: input,
      }),
      components: [],
    });

  if (inputAsNumber > authorData[currency])
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:coinflip.poor', {
        user: mentionUser(ctx.commandAuthor.id),
        currency: ctx.locale(`common:${currency}`),
        amount: input,
      }),
      components: [],
    });

  const availableOptions = ['cara', 'coroa'];
  const choice = randomFromArray(availableOptions);

  const winner = choice === 'cara' ? ctx.commandAuthor.id : ctx.user.id;
  const loser = choice === 'coroa' ? ctx.commandAuthor.id : ctx.user.id;

  await ctx.makeMessage({
    content: ctx.locale('commands:coinflip.text', {
      choice: ctx.locale(`commands:coinflip.${choice as 'cara'}`),
      value: input,
      winner: mentionUser(winner),
      loser: mentionUser(loser),
      emoji: EMOJIS[currency],
    }),
    components: [],
  });

  userRepository.updateUserWithSpecialData(winner, { [currency]: { $inc: inputAsNumber } });
  userRepository.updateUserWithSpecialData(loser, { [currency]: { $inc: negate(inputAsNumber) } });

  const parsedValue =
    currency === 'estrelinhas' ? inputAsNumber : huntValues[currency] * inputAsNumber;

  postCoinflipMatch(`${winner}`, `${loser}`, parsedValue);
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
    {
      name: 'moeda',
      nameLocalizations: { 'en-US': 'currency' },
      description: 'Moeda que será apostada. O padrão é estrelinhas',
      descriptionLocalizations: { 'en-US': 'Currency to be wagered. The default is stars' },
      type: ApplicationCommandOptionTypes.String,
      required: false,
      choices: transactionableCommandOption,
    },
  ],
  category: 'economy',
  authorDataFields: ['estrelinhas', 'demons', 'giants', 'angels', 'archangels', 'demigods', 'gods'],
  commandRelatedExecutions: [confirmCoinflip],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', true);
    const input = ctx.getOption<number>('aposta', false, true);
    const currency =
      ctx.getOption<typeof transactionableCommandOption[number]['value']>('moeda', false) ??
      'estrelinhas';

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

    if (input > ctx.authorData[currency])
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.poor', {
            user: mentionUser(ctx.author.id),
            currency: ctx.locale(`common:${currency}`),
            amount: input,
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

    if (input > targetData[currency])
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.poor', {
            user: mentionUser(user.id),
            currency: ctx.locale(`common:${currency}`),
            amount: input,
          }),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const confirmButton = createButton({
      customId: createCustomId(0, user.id, ctx.commandId, input, currency),
      label: ctx.locale('commands:coinflip.bet'),
      style: ButtonStyles.Success,
    });

    ctx.makeMessage({
      content: ctx.locale('commands:coinflip.confirm', {
        value: input,
        author: mentionUser(ctx.author.id),
        mention: mentionUser(user.id),
        emoji: EMOJIS[currency],
      }),
      allowedMentions: { parse: [AllowedMentionsTypes.UserMentions] },
      components: [createActionRow([confirmButton])],
    });

    finishCommand();
  },
});

export default CoinflipCommand;
