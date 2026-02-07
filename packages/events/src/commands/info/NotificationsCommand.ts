import md5 from 'md5';
import { ButtonStyles } from '@discordeno/bot';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { MessageFlags } from '@discordeno/bot';
import { createCommand } from '../../structures/command/createCommand.js';
import notificationRepository from '../../database/repositories/notificationRepository.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import {
  createActionRow,
  createButton,
  createContainer,
  createCustomId,
  createSeparator,
  createTextDisplay,
} from '../../utils/discord/componentUtils.js';
import { millisToSeconds } from '../../utils/miscUtils.js';
import { DatabaseNotificationSchema } from '../../types/database.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import userRepository from '../../database/repositories/userRepository.js';

const calculateNotificationHash = (notifications: DatabaseNotificationSchema[]): string =>
  md5(notifications.reduce((p, c) => `${p}${c._id}`, ''));

export const displayNotifications = async (
  ctx: ChatInputInteractionContext,
  notifications: DatabaseNotificationSchema[],
  globalNotifications: DatabaseNotificationSchema[],
): Promise<void> => {
  const normalNotifications = notifications.filter((n) => !n.important);
  const importantNotifications = [
    ...globalNotifications,
    ...notifications.filter((a) => a.important),
  ];

  let notificationsMessage = normalNotifications
    .map((n) =>
      ctx.locale(
        n.translationKey,
        n.translationValues
          ? { ...n.translationValues, unix: millisToSeconds(n.createdAt) }
          : { unix: millisToSeconds(n.createdAt) },
      ),
    )
    .join('\n- ');

  const importantMessage = importantNotifications
    .map((n) =>
      ctx.locale(
        n.translationKey,
        n.translationValues
          ? { ...n.translationValues, unix: millisToSeconds(n.createdAt) }
          : { unix: millisToSeconds(n.createdAt) },
      ),
    )
    .join('\n- ');

  const notificationHash = calculateNotificationHash(notifications);

  const notificationsComponent = [];

  if (importantMessage.length > 0) {
    notificationsComponent.push(
      createTextDisplay(
        `### ${ctx.prettyResponse('warn', 'commands:notificações.important-notifications')}`,
      ),
      createTextDisplay(`- ${importantMessage}`),
    );

    if (notificationsMessage.length > 0) notificationsComponent.push(createSeparator());
  }

  const importantLength = importantMessage.length;

  if (notificationsMessage.length > 3997 - importantLength)
    notificationsMessage = `${notificationsMessage.slice(0, 3997 - importantLength)}...`;

  if (notificationsMessage.length > 0) {
    notificationsComponent.push(
      createTextDisplay(`### ${ctx.locale('commands:notificações.your-notifications')}`),
      createTextDisplay(`- ${notificationsMessage}`),
    );
  }

  const markAsRead = createButton({
    label: ctx.locale('commands:notificações.mark-as-read', { count: notifications.length }),
    style: ButtonStyles.Primary,
    customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, notificationHash),
  });

  notificationsComponent.push(createActionRow([markAsRead]));

  const components = [
    createContainer({
      accentColor: hexStringToNumber(ctx.authorData.selectedColor),
      components: notificationsComponent,
    }),
  ];

  ctx.makeLayoutMessage({ components });
};

const executeMarkAsRead = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [sentHash] = ctx.sentData;

  const notifications = await notificationRepository.getUserUnreadNotifications(ctx.user.id);

  const newHash = calculateNotificationHash(notifications);

  if (newHash !== sentHash)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:notificações.cant-clear'),
    });

  await notificationRepository.markNotificationsAsRead(
    ctx.user.id,
    notifications.map((a) => a._id),
  );

  await userRepository.updateUser(ctx.user.id, { readNotificationsAt: Date.now() });

  ctx.makeLayoutMessage({
    components: [
      createTextDisplay(ctx.prettyResponse('success', 'commands:notificações.all-done')),
    ],
  });
};

const NotificationsCommand = createCommand({
  path: '',
  name: 'notificações',
  nameLocalizations: { 'en-US': 'notifications' },
  description: '「🔔」・Veja as suas notificações não lidas',
  descriptionLocalizations: { 'en-US': '「🔔」・Check your unread notifications' },
  category: 'info',
  authorDataFields: ['selectedColor'],
  commandRelatedExecutions: [executeMarkAsRead],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const notifications = await notificationRepository.getUserUnreadNotifications(ctx.user.id);
    const globalNotifications = await notificationRepository.getGlobalUnreadNotifications(
      ctx.authorData.readNotificationsAt,
    );

    if (notifications.length === 0 && globalNotifications.length === 0)
      return ctx.makeLayoutMessage({
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:notificações.no-unread-notificaions'),
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });

    displayNotifications(ctx, notifications, globalNotifications);
  },
});

export default NotificationsCommand;
