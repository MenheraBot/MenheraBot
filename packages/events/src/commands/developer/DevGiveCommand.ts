import {
  ApplicationCommandOptionTypes,
  ButtonStyles,
  MessageFlags,
  TextStyles,
} from '@discordeno/bot';
import userRepository from '../../database/repositories/userRepository.js';

import { createCommand } from '../../structures/command/createCommand.js';
import titlesRepository from '../../database/repositories/titlesRepository.js';
import giveRepository from '../../database/repositories/giveRepository.js';
import notificationRepository from '../../database/repositories/notificationRepository.js';
import { User } from '../../types/discordeno.js';
import {
  createActionRow,
  createAsyncCustomId,
  createButton,
  createContainer,
  createCustomId,
  createLabel,
  createSection,
  createSeparator,
  createTextDisplay,
  createTextInput,
  deleteMessageCustomId,
} from '../../utils/discord/componentUtils.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { InteractionContext } from '../../types/menhera.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import { ModalInteraction } from '../../types/interaction.js';
import { extractLayoutFields } from '../../utils/discord/modalUtils.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import { bot } from '../../index.js';
import { EMOJIS } from '../../structures/constants.js';

const buildNotificationContainer = async (
  ctx: InteractionContext,
  user: User,
  ptMessage: string,
  enMessage: string,
) => {
  const disableSend = !ptMessage || ptMessage.length < 1 || !enMessage || enMessage.length < 1;

  return createContainer({
    components: [
      createSection({
        components: [
          createTextDisplay(
            `## Enviar notificação à ${user.id === bot.applicationId ? 'TODOS USUÁRIOS!!!' : getDisplayName(user)}`,
          ),
        ],
        accessory: createButton({
          label: 'Cancelar',
          style: ButtonStyles.Secondary,
          customId: deleteMessageCustomId,
        }),
      }),
      createSeparator(),
      createTextDisplay(
        `${EMOJIS.br} \`\`\`\n${ptMessage.length < 1 ? 'Mensagem vazia' : ptMessage}\`\`\``,
      ),
      createTextDisplay(
        `${EMOJIS.us} \`\`\`\n${enMessage.length < 1 ? 'Empty message' : enMessage}\`\`\``,
      ),
      createSeparator(),
      createActionRow([
        createButton({
          style: ButtonStyles.Primary,
          label: 'Editar mensagem',
          customId: await createAsyncCustomId(
            0,
            ctx.user.id,
            ctx.originalInteractionId,
            'EDIT',
            user.id,
            ptMessage,
            enMessage,
          ),
        }),
        createButton({
          style: disableSend ? ButtonStyles.Secondary : ButtonStyles.Success,
          disabled: disableSend,
          label: 'Criar notificação',
          customId: await createAsyncCustomId(
            0,
            ctx.user.id,
            ctx.originalInteractionId,
            'SEND',
            user.id,
            ptMessage,
            enMessage,
          ),
        }),
      ]),
    ],
  });
};
const executeCompontentNotification = async (ctx: ComponentInteractionContext) => {
  const [action, userId, ptMessage, enMessage] = ctx.sentData;

  if (action === 'EDIT')
    return ctx.respondWithModal({
      title: 'Editar mensagem',
      customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'MODAL', userId),
      components: [
        createLabel({
          label: `${EMOJIS.br} Mensagem`,
          description: 'Lembre-se de ser fofinho na mensagem',
          component: createTextInput({
            customId: 'pt-BR',
            style: TextStyles.Paragraph,
            placeholder: 'Mensagem vazia',
            required: true,
            value: ptMessage,
          }),
        }),
        createLabel({
          label: `${EMOJIS.us} Message`,
          description: 'Remember to be cute',
          component: createTextInput({
            customId: 'en-US',
            style: TextStyles.Paragraph,
            placeholder: 'Empty message',
            required: true,
            value: enMessage,
          }),
        }),
      ],
    });

  if (action === 'MODAL') {
    const updatedPt =
      extractLayoutFields(ctx.interaction as ModalInteraction).find((a) => a.customId === 'pt-BR')
        ?.value ?? '';
    const updatedEn =
      extractLayoutFields(ctx.interaction as ModalInteraction).find((a) => a.customId === 'en-US')
        ?.value ?? '';

    const user = await cacheRepository.getDiscordUser(userId, true);

    if (!user) throw new Error(`Sem user`);

    const container = await buildNotificationContainer(ctx, user, updatedPt, updatedEn);

    return ctx.makeLayoutMessage({ components: [container], flags: MessageFlags.Ephemeral });
  }

  if (action === 'SEND') {
    if (!ptMessage || ptMessage.length < 3 || !enMessage || enMessage.length < 3)
      return ctx.makeLayoutMessage({
        components: [createTextDisplay('Precisa de um texto valido pai')],
      });

    await notificationRepository.createNotification(
      userId,
      'commands:notificações.notifications.lux-message',
      { ptBr: ptMessage, enUs: enMessage },
      true,
    );

    ctx.makeLayoutMessage({
      components: [createContainer({ components: [createTextDisplay('Mensagem enviada!')] })],
    });
  }
};

const GiveBadgeCommand = createCommand({
  path: '',
  name: 'give',
  description: '[DEV] Dá.',
  options: [
    {
      name: 'notificação',
      description: '[DEV] Cria uma notificação do sistema na conta de alguém',
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'user',
          description: 'Usuário para criar a notificação',
          type: ApplicationCommandOptionTypes.User,
          required: true,
        },
      ],
    },
    {
      name: 'badge',
      description: '[DEV] Dá uma Badge pra alguém',
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'user',
          description: 'User pra da badge',
          type: ApplicationCommandOptionTypes.User,
          required: true,
        },
        {
          name: 'badgeid',
          description: 'id da badge',
          type: ApplicationCommandOptionTypes.Integer,
          autocomplete: true,
          required: true,
        },
      ],
    },
    {
      name: 'titulo',
      description: '[DEV] Dá um titulo pra alguem',
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'user',
          description: 'User pra da o itutlo',
          type: ApplicationCommandOptionTypes.User,
          required: true,
        },
        {
          name: 'titleid',
          description: 'id do titulo',
          type: ApplicationCommandOptionTypes.Integer,
          required: true,
        },
      ],
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  commandRelatedExecutions: [executeCompontentNotification],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const subCommand = ctx.getSubCommand();

    if (subCommand === 'notificação') {
      const user = ctx.getOption<User>('user', 'users', true);

      const container = await buildNotificationContainer(ctx, user, '', '');

      return ctx.makeLayoutMessage({ components: [container], flags: MessageFlags.Ephemeral });
    }

    if (subCommand === 'badge') {
      const { id: userId } = ctx.getOption<User>('user', 'users', true);
      const badgeId = ctx.getOption<number>('badgeid', false, true);

      const userData = await userRepository.ensureFindUser(userId);

      if (userData.badges.some((a) => a.id === badgeId))
        return finishCommand(ctx.makeMessage({ content: 'Este usuário já possui esta badge!' }));

      await giveRepository.giveBadgeToUser(userId, badgeId as 1);

      notificationRepository.createNotification(
        userId,
        'commands:notificações.notifications.lux-gave-badge',
        {},
      );

      return ctx.makeMessage({ content: 'Badge adicionada a conta do user UwU' });
    }

    const { id: userId } = ctx.getOption<User>('user', 'users', true);
    const titleId = ctx.getOption<number>('titleid', false, true);

    const titleExists = await titlesRepository.getTitleInfo(titleId);

    if (!titleExists) return ctx.makeMessage({ content: 'Titulo nao existe' });

    const userTitles = await userRepository.ensureFindUser(userId);

    if (userTitles.titles.some((a) => a.id === titleId))
      return ctx.makeMessage({ content: 'Esse usuário ja tem esse titulo' });

    await giveRepository.giveTitleToUser(userId, titleId);

    notificationRepository.createNotification(
      userId,
      'commands:notificações.notifications.lux-gave-title',
      {},
    );

    return ctx.makeMessage({ content: 'Titulo adicionado na conta do user UwU' });
  },
});

export default GiveBadgeCommand;
