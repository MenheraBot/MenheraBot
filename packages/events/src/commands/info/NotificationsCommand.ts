import md5 from 'md5';
import { ButtonStyles } from 'discordeno/types';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { createCommand } from '../../structures/command/createCommand';
import notificationRepository from '../../database/repositories/notificationRepository';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { millisToSeconds } from '../../utils/miscUtils';
import { DatabaseNotificationSchema } from '../../types/database';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';

const calculateNotificationHash = (notifications: DatabaseNotificationSchema[]): string =>
  md5(notifications.reduce((p, c) => `${p}${c._id}`, ''));

export const displayNotifications = async (
  ctx: ChatInputInteractionContext,
  notifications: DatabaseNotificationSchema[],
): Promise<void> => {
  const notificationsMessage = notifications.map((n) =>
    ctx.locale(
      n.translationKey,
      n.translationValues
        ? { ...n.translationValues, unix: millisToSeconds(n.createdAt) }
        : { unix: millisToSeconds(n.createdAt) },
    ),
  );

  const notificationHash = calculateNotificationHash(notifications);

  const embed = createEmbed({
    color: hexStringToNumber(ctx.authorData.selectedColor),
    description: `- ${notificationsMessage.join('\n- ')}`,
    title: ctx.locale('commands:notificações.your-notifications'),
  });

  const markAsRead = createButton({
    label: ctx.locale('commands:notificações.mark-as-read', { count: notifications.length }),
    style: ButtonStyles.Primary,
    customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, notificationHash),
  });

  ctx.makeMessage({ components: [createActionRow([markAsRead])], embeds: [embed] });
};

const executeMarkAsRead = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [sentHash] = ctx.sentData;

  const notifications = await notificationRepository.getUserUnreadNotifications(ctx.user.id);

  const newHash = calculateNotificationHash(notifications);

  if (newHash !== sentHash)
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('error', 'commands:notificações.cant-clear'),
    });

  await notificationRepository.markNotificationsAsRead(
    ctx.user.id,
    notifications.map((a) => a._id),
  );

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: ctx.prettyResponse('success', 'commands:notificações.all-done'),
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

    if (notifications.length === 0)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:notificações.no-unread-notificaions'),
        flags: MessageFlags.EPHEMERAL,
      });

    displayNotifications(ctx, notifications);
  },
});

export default NotificationsCommand;
