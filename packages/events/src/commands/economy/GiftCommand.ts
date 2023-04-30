import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import userRepository from '../../database/repositories/userRepository';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import giveRepository from '../../database/repositories/giveRepository';
import { mentionUser } from '../../utils/discord/userUtils';
import { DatabaseHuntingTypes } from '../../modules/hunt/types';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import { createCommand } from '../../structures/command/createCommand';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { EMOJIS } from '../../structures/constants';

const choices = [
  {
    name: '⭐ | Estrelinhas',
    nameLocalizations: { 'en-US': '⭐ | Stars' },
    value: 'estrelinhas',
  },
  {
    name: '😈 | Demônios',
    nameLocalizations: { 'en-US': '😈 | Demons' },
    value: 'demons',
  },
  {
    name: '👊 | Gigantes',
    nameLocalizations: { 'en-US': '👊 | Giants' },
    value: 'giants',
  },
  {
    name: '👼 | Anjos',
    nameLocalizations: { 'en-US': '👼 | Angels' },
    value: 'angels',
  },
  {
    name: '🧚‍♂️ | Arcanjos',
    nameLocalizations: { 'en-US': '🧚‍♂️ | Archangels' },
    value: 'archangels',
  },
  {
    name: '🙌 | Semideuses',
    nameLocalizations: { 'en-US': '🙌 | Demigods' },
    value: 'demigods',
  },
  {
    name: '✝️ | Deuses',
    nameLocalizations: { 'en-US': '✝️ | Gods' },
    value: 'gods',
  },
];

const executeGiftConfirmation = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedButton, amount, selectedOption] = ctx.sentData;

  if (selectedButton === 'NEGATE') {
    ctx.makeMessage({
      content: ctx.locale('commands:presentear.negated', { user: mentionUser(ctx.user.id) }),
      components: [],
    });
    return;
  }

  const authorData = await userRepository.ensureFindUser(ctx.commandAuthor.id);

  if (Number(amount) > authorData[selectedOption as 'estrelinhas'])
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:presentear.user-poor', {
        field: ctx.locale(`common:${selectedOption as 'estrelinhas'}`),
        user: mentionUser(ctx.commandAuthor.id),
      }),
      components: [],
    });

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:presentear.transfered', {
      value: amount,
      emoji: EMOJIS[selectedOption as 'estrelinhas'],
      user: mentionUser(ctx.user.id),
    }),
    components: [],
  });

  await giveRepository.executeGive(
    selectedOption as 'estrelinhas',
    ctx.commandAuthor.id,
    ctx.user.id,
    Number(amount),
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
      name: 'tipo',
      nameLocalizations: { 'en-US': 'type' },
      description: 'O tipo de item que quer presentear',
      descriptionLocalizations: { 'en-US': 'The type of item you want to gift' },
      type: ApplicationCommandOptionTypes.String,
      choices,
      required: true,
    },
    {
      name: 'valor',
      nameLocalizations: { 'en-US': 'amount' },
      description: 'A quantidade para presentear',
      descriptionLocalizations: { 'en-US': 'The amount to gift' },
      type: ApplicationCommandOptionTypes.Integer,
      required: true,
      minValue: 1,
    },
  ],
  category: 'economy',
  authorDataFields: ['estrelinhas', 'demons', 'giants', 'angels', 'archangels', 'gods', 'demigods'],
  commandRelatedExecutions: [executeGiftConfirmation],
  execute: async (ctx, finishCommand) => {
    const toSendUser = ctx.getOption<User>('user', 'users', true);
    const selectedOption = ctx.getOption<DatabaseHuntingTypes | 'estrelinhas'>('tipo', false, true);
    const amount = ctx.getOption<number>('valor', false, true);

    if (amount > ctx.authorData[selectedOption])
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:presentear.poor', {
            field: ctx.locale(`common:${selectedOption}`),
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
          emoji: EMOJIS[selectedOption],
          user: mentionUser(toSendUser.id),
        }),
      });

      await giveRepository.executeGive(selectedOption, ctx.author.id, toSendUser.id, amount);
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
      customId: createCustomId(0, toSendUser.id, ctx.commandId, 'ACCEPT', amount, selectedOption),
      style: ButtonStyles.Success,
      label: ctx.locale('common:accept'),
    });

    const negateButton = createButton({
      customId: createCustomId(0, toSendUser.id, ctx.commandId, 'NEGATE'),
      style: ButtonStyles.Danger,
      label: ctx.locale('common:negate'),
    });

    await ctx.makeMessage({
      content: ctx.prettyResponse('question', 'commands:presentear.confirm', {
        user: mentionUser(toSendUser.id),
        author: mentionUser(ctx.author.id),
        count: amount,
        emoji: EMOJIS[selectedOption],
      }),
      allowedMentions: { users: [toSendUser.id] },
      components: [createActionRow([confirmButton, negateButton])],
    });

    return finishCommand();
  },
});

export default GiftCommand;
