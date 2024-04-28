import { BigString } from 'discordeno/types';
import { notificationModel } from '../collections';
import { DatabaseNotificationSchema } from '../../types/database';
import { MainRedisClient } from '../databases';
import { daysToMillis } from '../../utils/miscUtils';
import { Translation } from '../../types/i18next';
import { registerCacheStatus } from '../../structures/initializePrometheus';

const parseNotification = (
  notification: DatabaseNotificationSchema,
): DatabaseNotificationSchema => ({
  _id: `${notification._id}`,
  userId: notification.userId,
  createdAt: notification.createdAt,
  translationKey: notification.translationKey,
  translationValues: notification.translationValues,
  unread: notification.unread,
});

const purgeNotificationCache = (userId: BigString): void => {
  MainRedisClient.del(`notifications:${userId}`);
  MainRedisClient.del(`notifications_count:${userId}`);
};

const createNotification = async (
  userId: BigString,
  translationKey: Translation,
  translationValues: unknown,
): Promise<void> => {
  purgeNotificationCache(userId);

  await notificationModel.create({
    userId: `${userId}`,
    createdAt: Date.now(),
    translationKey,
    translationValues,
    unread: true,
  });
};

const getUserUnreadNotifications = async (
  userId: BigString,
): Promise<DatabaseNotificationSchema[]> => {
  const fromRedis = await MainRedisClient.get(`notifications:${userId}`);

  registerCacheStatus(fromRedis, 'notifications');

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await notificationModel.find({ userId: `${userId}`, unread: true });

  MainRedisClient.setex(`notifications_count:${userId}`, 3600, fromMongo.length);

  await MainRedisClient.setex(
    `notifications:${userId}`,
    3600,
    JSON.stringify(fromMongo.map(parseNotification)),
  );

  return fromMongo;
};

const getUserTotalUnreadNotifications = async (userId: BigString): Promise<number> => {
  const fromRedis = await MainRedisClient.get(`notifications_count:${userId}`);

  registerCacheStatus(fromRedis, 'notifications_count');

  if (fromRedis) return Number(fromRedis);

  const fromMongo = await notificationModel.countDocuments({ userId: `${userId}`, unread: true });

  await MainRedisClient.set(`notifications_count:${userId}`, fromMongo);

  return fromMongo;
};

const markNotificationsAsRead = async (
  userId: BigString,
  notificationIds: string[],
): Promise<void> => {
  purgeNotificationCache(userId);

  await notificationModel.updateMany(
    { _id: { $in: notificationIds } },
    { $set: { unread: false } },
  );
};

const deleteOldNotifications = async (): Promise<void> => {
  const thirtyDays = Date.now() - daysToMillis(30);

  const oldNotifications = await notificationModel.find({ createdAt: { $lt: thirtyDays } });

  const notificationIds = oldNotifications.map((a) => a._id);
  const uniqueUserIds = oldNotifications.reduce<string[]>(
    (p, c) => (p.includes(c.userId) ? p : [...p, c.userId]),
    [],
  );

  uniqueUserIds.forEach(purgeNotificationCache);
  await notificationModel.deleteMany({ _id: { $in: notificationIds } });
};

export default {
  createNotification,
  getUserUnreadNotifications,
  markNotificationsAsRead,
  getUserTotalUnreadNotifications,
  deleteOldNotifications,
};
