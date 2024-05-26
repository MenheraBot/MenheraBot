import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import userRepository from '../../database/repositories/userRepository';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import giveRepository from '../../database/repositories/giveRepository';
import { mentionUser } from '../../utils/discord/userUtils';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import { createCommand } from '../../structures/command/createCommand';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { EMOJIS } from '../../structures/constants';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { ApiTransactionReason } from '../../types/api';

const executeGiftConfirmation = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedButton, amount] = ctx.sentData;

  if (selectedButton === 'NEGATE') {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:presentear.negated', {
        user: mentionUser(ctx.user.id),
      }),
      components: [],
    });
    return;
  }

  const authorData = await userRepository.ensureFindUser(ctx.commandAuthor.id);

  if (Number(amount) > authorData.estrelinhas)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:presentear.user-poor', {
        field: ctx.locale(`common:estrelinhas`),
        user: mentionUser(ctx.commandAuthor.id),
      }),
      components: [],
    });

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:presentear.transfered', {
      value: amount,
      emoji: EMOJIS.estrelinhas,
      user: mentionUser(ctx.user.id),
      author: mentionUser(ctx.commandAuthor.id),
    }),
    components: [],
  });

  await giveRepository.executeGive(
    'estrelinhas',
    ctx.commandAuthor.id,
    ctx.user.id,
    Number(amount),
  );

  await postTransaction(
    `${ctx.commandAuthor.id}`,
    `${ctx.user.id}`,
    Number(amount),
    'estrelinhas',
    ApiTransactionReason.PIX_COMMAND,
  );
};

const GiftCommand = createCommand({
  path: '',
  name: 'pix',
  nameLocalizations: { 'en-US': 'gift' },
  description: '「🎁」・Envie um Pix para alguém',
  descriptionLocalizations: { 'en-US': '「🎁」・Give to someone else a gift from your inventory' },
  options: [
    {
      name: 'user',
      description: 'Usuário para presentear',
      descriptionLocalizations: { 'en-US': 'User to gift' },
      type: ApplicationCommandOptionTypes.User,
      required: true,
    },
    {
      name: 'valor',
      nameLocalizations: { 'en-US': 'amount' },
      description: 'A quantidade de estrelinhas que você quer presentear',
      descriptionLocalizations: { 'en-US': 'The number of stars you want to presentt' },
      type: ApplicationCommandOptionTypes.Integer,
      required: true,
      minValue: 1,
    },
  ],
  category: 'economy',
  authorDataFields: ['estrelinhas'],
  commandRelatedExecutions: [executeGiftConfirmation],
  execute: async (ctx, finishCommand) => {
    const toSendUser = ctx.getOption<User>('user', 'users', true);
    const amount = ctx.getOption<number>('valor', false, true);

    if (amount > ctx.authorData.estrelinhas)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:presentear.poor', {
            field: ctx.locale(`common:estrelinhas`),
          }),
        }),
      );

    if (toSendUser.id === ctx.author.id)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:presentear.self-mention'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    if (toSendUser.toggles.bot) {
      ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:presentear.transfered', {
          value: amount,
          author: mentionUser(ctx.author.id),
          emoji: EMOJIS.estrelinhas,
          user: mentionUser(toSendUser.id),
        }),
      });

      await giveRepository.executeGive('estrelinhas', ctx.author.id, toSendUser.id, amount);
      await postTransaction(
        `${ctx.author.id}`,
        `${toSendUser.id}`,
        Number(amount),
        'estrelinhas',
        ApiTransactionReason.PIX_COMMAND,
      );
      return finishCommand();
    }

    if (await blacklistRepository.isUserBanned(toSendUser.id))
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:presentear.banned-user'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const confirmButton = createButton({
      customId: createCustomId(0, toSendUser.id, ctx.originalInteractionId, 'ACCEPT', amount),
      style: ButtonStyles.Success,
      label: ctx.locale('common:accept'),
    });

    const negateButton = createButton({
      customId: createCustomId(0, toSendUser.id, ctx.originalInteractionId, 'NEGATE'),
      style: ButtonStyles.Danger,
      label: ctx.locale('common:negate'),
    });

    await ctx.makeMessage({
      content: ctx.prettyResponse('question', 'commands:presentear.confirm', {
        user: mentionUser(toSendUser.id),
        author: mentionUser(ctx.author.id),
        count: amount,
        emoji: EMOJIS.estrelinhas,
      }),
      allowedMentions: { users: [toSendUser.id] },
      components: [createActionRow([confirmButton, negateButton])],
    });

    return finishCommand();
  },
});

export default GiftCommand;
