import md5 from 'md5';
import { ButtonStyles } from '@discordeno/bot';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { MessageFlags } from '@discordeno/bot';
import { createCommand } from '../../structures/command/createCommand.js';
import notificationRepository from '../../database/repositories/notificationRepository.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';
import { millisToSeconds } from '../../utils/miscUtils.js';
import { DatabaseNotificationSchema } from '../../types/database.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';

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

  if (embed.description?.length ?? 0 > 4050)
    embed.description = `${embed.description?.slice(0, 4050)}...`;

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
      flags: MessageFlags.Ephemeral,
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
        flags: MessageFlags.Ephemeral,
      });

    displayNotifications(ctx, notifications);
  },
});

export default NotificationsCommand;
