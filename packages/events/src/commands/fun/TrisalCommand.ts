import {
  ApplicationCommandOptionTypes,
  ButtonStyles,
  InteractionResponseTypes,
  MessageComponentTypes,
} from 'discordeno/types';
import { Interaction, User } from 'discordeno/transformers';

import InteractionCollector from '../../structures/InteractionCollector';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';
import { getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import cacheRepository from '../../database/repositories/cacheRepository';
import {
  createButton,
  createActionRow,
  disableComponents,
  generateCustomId,
  createCustomId,
} from '../../utils/discord/componentUtils';
import relationshipRepostory from '../../database/repositories/relationshipRepostory';
import { MessageFlags } from '../../utils/discord/messageUtils';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { createCommand } from '../../structures/command/createCommand';
import userRepository from '../../database/repositories/userRepository';
import { bot } from '../../index';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';

const executeFinishTrisalConfirmation = async (ctx: ComponentInteractionContext): Promise<void> => {
  const authorData = await userRepository.ensureFindUser(ctx.user.id);

  if (authorData.trisal.length === 0)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:trisal.not-in-trisal'),
    });

  ctx.makeMessage({
    components: [],
    content: ctx.prettyResponse('success', 'commands:trisal.untrisal.done'),
  });

  const hasThirdUser = authorData.trisal.length === 3;

  await relationshipRepostory.executeUntrisal(
    authorData.trisal[0],
    authorData.trisal[1],
    hasThirdUser ? authorData.trisal[2] : ctx.user.id,
  );
};

const executeFinishTrisal = async (
  ctx: ChatInputInteractionContext,
  finishCommand: (args?: unknown) => unknown,
): Promise<unknown> => {
  if (ctx.authorData.trisal.length === 0)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.not-in-trisal'),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  const sureButton = createButton({
    style: ButtonStyles.Danger,
    customId: createCustomId(0, ctx.author.id, ctx.commandId),
    label: ctx.locale('commands:trisal.untrisal.breakup'),
  });

  await ctx.makeMessage({
    content: ctx.prettyResponse('question', 'commands:trisal.untrisal.sure'),
    components: [createActionRow([sureButton])],
  });

  finishCommand();
};

const executeMakeTrisal = async (
  ctx: ChatInputInteractionContext,
  finishCommand: (args?: unknown) => unknown,
) => {
  const firstUser = ctx.getOption<User>('user', 'users', true);
  const secondUser = ctx.getOption<User>('user_dois', 'users', true);
  const thirdUser = ctx.getOption<User>('user', 'users') ?? ctx.author;

  if (firstUser.toggles.bot || secondUser.toggles.bot || thirdUser.toggles.bot)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.bot-mention'),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  const trisalIds = [firstUser.id, secondUser.id, thirdUser.id];

  const withUser = trisalIds.filter((a) => a === ctx.author.id).length;

  if (withUser !== 1)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.mention-error'),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  if (
    firstUser.id === secondUser.id ||
    firstUser.id === thirdUser.id ||
    secondUser.id === thirdUser.id
  )
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.same-mention'),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  const usersWithoutOwner = trisalIds.filter((a) => a !== ctx.author.id);

  const [firstUserData, secondUserData] = await Promise.all([
    userRepository.ensureFindUser(usersWithoutOwner[0]),
    userRepository.ensureFindUser(usersWithoutOwner[1]),
  ]);

  if (!firstUserData || !secondUserData)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.no-db'),
      }),
    );

  if (firstUserData.ban || secondUserData.ban)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.banned-user'),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  if (firstUserData.trisal.length > 0 || secondUserData.trisal.length > 0)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.comedor-de-casadas'),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  const confirmButton = createButton({
    customId: generateCustomId('CONFIRM', ctx.interaction.id),
    label: ctx.locale('common:accept'),
    style: ButtonStyles.Success,
  });

  ctx.makeMessage({
    content: ctx.locale('commands:trisal.accept-message', {
      first: mentionUser(firstUser.id),
      second: mentionUser(secondUser.id),
      third: mentionUser(thirdUser.id),
    }),
    components: [createActionRow([confirmButton])],
  });

  // PLEASE REMOVE THIS COLLECTOR IN THE FUTURE!!!!!!!!

  const filter = (int: Interaction) => {
    const startsCustomId = int.data?.customId?.startsWith(`${ctx.interaction.id}`);

    if (!startsCustomId) return false;

    bot.helpers.sendInteractionResponse(int.id, int.token, {
      type: InteractionResponseTypes.DeferredUpdateMessage,
    });

    return trisalIds.includes(int.user.id);
  };

  const collector = new InteractionCollector({
    filter,
    channelId: ctx.channelId,
    idle: 15_000,
    componentType: MessageComponentTypes.Button,
  });

  const acceptedIds: bigint[] = [];

  collector.once('end', () => {
    if (acceptedIds.length !== 3)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:trisal.error'),
          components: [
            createActionRow(disableComponents(ctx.locale('common:timesup'), [confirmButton])),
          ],
        }),
      );
  });

  collector.on('collect', async (int: Interaction) => {
    if (!acceptedIds.includes(int.user.id)) acceptedIds.push(int.user.id);

    if (acceptedIds.length === 3) {
      ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:trisal.done'),
        components: [
          createActionRow([
            createButton({
              label: '',
              style: ButtonStyles.Success,
              customId: 'DONE',
              emoji: { name: '💍' },
              disabled: true,
            }),
          ]),
        ],
      });

      collector.stop();

      await relationshipRepostory.executeTrisal(firstUser.id, secondUser.id, thirdUser.id);
      finishCommand();
    }
  });
};

const executeOrderTrisal = async (
  ctx: ChatInputInteractionContext,
  finishCommand: (args?: unknown) => unknown,
) => {
  if (ctx.authorData.trisal.length === 0)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.not-in-trisal'),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  const newIdOrder = [
    ctx.getOption<User>('primeiro_usuário', 'users', true).id,
    ctx.getOption<User>('segundo_usuário', 'users', true).id,
    ctx.getOption<User>('terceiro_usuário', 'users', true).id,
  ];

  if (ctx.authorData.trisal.length === 2) ctx.authorData.trisal.push(`${ctx.author.id}`);

  if (newIdOrder.some((a) => !ctx.authorData.trisal.includes(`${a}`)))
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.some-user-not-in-trisal'),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  if (
    newIdOrder[1] === newIdOrder[2] ||
    newIdOrder[0] === newIdOrder[2] ||
    newIdOrder[0] === newIdOrder[1]
  )
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.same-mention'),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  ctx.makeMessage({ content: ctx.prettyResponse('success', 'commands:trisal.order-done') });

  await relationshipRepostory.executeTrisal(newIdOrder[0], newIdOrder[1], newIdOrder[2]);
  finishCommand();
};

const executeDisplayTrisal = async (
  ctx: ChatInputInteractionContext,
  finishCommand: (...args: unknown[]) => unknown,
) => {
  const user = ctx.getOption<User>('user', 'users', false) ?? ctx.author;

  const userData =
    user.id === ctx.author.id ? ctx.authorData : await userRepository.findUser(user.id);

  if (!userData)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.user-not-in-trisal'),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  if (userData.trisal.length === 0)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse(
          'error',
          `commands:trisal.${user.id !== ctx.author.id ? 'user-' : ''}not-in-trisal`,
        ),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  const marryOne = await cacheRepository.getDiscordUser(userData.trisal[0]);
  const marryTwo = await cacheRepository.getDiscordUser(userData.trisal[1]);
  const marryThree =
    // eslint-disable-next-line no-nested-ternary
    userData.trisal.length === 3
      ? await cacheRepository.getDiscordUser(userData.trisal[2])
      : user.id === ctx.author.id
      ? ctx.author
      : null;

  if (!marryOne || !marryTwo || !marryThree)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:trisal.marry-not-found'),
        flags: MessageFlags.EPHEMERAL,
      }),
    );

  const firstAvatar = getUserAvatar(marryOne);
  const secondAvatar = getUserAvatar(marryTwo);
  const thirdAvatar = getUserAvatar(marryThree);

  await ctx.defer();

  const res = await vanGoghRequest(VanGoghEndpoints.Trisal, {
    userOne: firstAvatar,
    userTwo: secondAvatar,
    userThree: thirdAvatar,
  });

  if (res.err)
    return finishCommand(
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:http-error'),
      }),
    );

  const embed = createEmbed({
    title: ctx.locale('commands:trisal.title'),
    description: `${mentionUser(marryOne.id)}, ${mentionUser(marryTwo.id)}, ${mentionUser(
      marryThree.id,
    )}`,
    color: hexStringToNumber(ctx.authorData.selectedColor),
    image: { url: 'attachment://trisal-kawaii.png' },
  });

  ctx.makeMessage({ embeds: [embed], file: { blob: res.data, name: 'trisal-kawaii.png' } });
  finishCommand();
};

const TrisalCommand = createCommand({
  path: '',
  name: 'trisal',
  nameLocalizations: { 'en-US': 'polyamory' },
  description: '「💘」・Faça um belo trisal com seus amigos',
  descriptionLocalizations: { 'en-US': '「💘」・Start a poliamory with your friends' },
  options: [
    {
      name: 'ver',
      nameLocalizations: { 'en-US': 'see' },
      type: ApplicationCommandOptionTypes.SubCommand,
      description: '「💘」・Veja o trisal atual de alguém',
      descriptionLocalizations: { 'en-US': '「💘」・See the current poliamory of someone' },
      options: [
        {
          name: 'user',
          type: ApplicationCommandOptionTypes.User,
          description: 'Usuário para ver o trisal',
          descriptionLocalizations: { 'en-US': 'User to see their polyamory' },
          required: false,
        },
      ],
    },
    {
      name: 'terminar',
      nameLocalizations: { 'en-US': 'breakup' },
      type: ApplicationCommandOptionTypes.SubCommand,
      description: '「💔」・Termine o seu trisal atual',
      descriptionLocalizations: { 'en-US': '「💔」・ Breakup with your current polyamory' },
    },
    {
      name: 'formar',
      type: ApplicationCommandOptionTypes.SubCommand,
      description: '「💘」・Faça um belo trisal com seus amigos',
      descriptionLocalizations: { 'en-US': '「💘」・Start a poliamory with your friends' },
      nameLocalizations: { 'en-US': 'make' },
      options: [
        {
          name: 'user',
          type: ApplicationCommandOptionTypes.User,
          description: 'Primeiro usuário do trisal',
          descriptionLocalizations: { 'en-US': 'First user of the polyamory' },
          required: true,
        },
        {
          name: 'user_dois',
          nameLocalizations: { 'en-US': 'second_user' },
          type: ApplicationCommandOptionTypes.User,
          description: 'Segundo usuário do trisal',
          descriptionLocalizations: { 'en-US': 'Second user of the polyamory' },
          required: true,
        },
      ],
    },
    {
      name: 'ordem',
      type: ApplicationCommandOptionTypes.SubCommand,
      description: '「💘」・Arrume a ordem das pessoas das metadinhas',
      descriptionLocalizations: {
        'en-US': '「💘」・Fix the order of the users avatars in the command',
      },
      nameLocalizations: { 'en-US': 'order' },
      options: [
        {
          name: 'primeiro_usuário',
          nameLocalizations: { 'en-US': 'first_user' },
          type: ApplicationCommandOptionTypes.User,
          description: 'Primeiro usuário do trisal',
          descriptionLocalizations: { 'en-US': 'First user of the polyamory' },
          required: true,
        },
        {
          name: 'segundo_usuário',
          nameLocalizations: { 'en-US': 'second_user' },
          type: ApplicationCommandOptionTypes.User,
          description: 'Segundo usuário do trisal',
          descriptionLocalizations: { 'en-US': 'Second user of the polyamory' },
          required: true,
        },
        {
          name: 'terceiro_usuário',
          nameLocalizations: { 'en-US': 'third_user' },
          type: ApplicationCommandOptionTypes.User,
          description: 'Terceiro usuário do trisal',
          descriptionLocalizations: { 'en-US': 'Third user of the polyamory' },
          required: true,
        },
      ],
    },
  ],
  category: 'fun',
  authorDataFields: ['trisal', 'selectedColor'],
  commandRelatedExecutions: [executeFinishTrisalConfirmation],
  execute: async (ctx, finishCommand) => {
    const command = ctx.getSubCommand();

    switch (command) {
      case 'ver':
        return executeDisplayTrisal(ctx, finishCommand);
      case 'ordem':
        return executeOrderTrisal(ctx, finishCommand);
      case 'terminar':
        return executeFinishTrisal(ctx, finishCommand);
      case 'formar':
        return executeMakeTrisal(ctx, finishCommand);
    }
  },
});

export default TrisalCommand;
