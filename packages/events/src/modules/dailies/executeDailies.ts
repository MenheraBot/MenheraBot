import notificationRepository from '../../database/repositories/notificationRepository';
import userRepository from '../../database/repositories/userRepository';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { DatabaseUserSchema } from '../../types/database';
import { FINISHED_DAILY_AWARD, getDailyById } from './dailies';
import { getUserDailies } from './getUserDailies';
import { DatabaseDaily } from './types';

const useCommand = async (
  ctx: ChatInputInteractionContext,
  user: DatabaseUserSchema,
): Promise<void> => {
  const userDailies = getUserDailies(user);

  const setter: Record<string, DatabaseDaily> = {};
  const incrementer: Partial<DatabaseUserSchema> = {};

  let needUpdate = false;
  let finishedDailies = 0;

  userDailies.forEach((daily, i) => {
    const dailyData = getDailyById(daily.id);

    if (dailyData.type !== 'use_command' || dailyData.name !== ctx.interaction.data?.name) return;

    if (daily.has >= daily.need) return;

    needUpdate = true;
    daily.has += 1;
    setter[`dailies.${i}`] = daily;

    if (daily.has >= daily.need) finishedDailies += 1;
  }, []);

  if (!needUpdate) return;

  if (finishedDailies > 0) {
    const award = finishedDailies * FINISHED_DAILY_AWARD;
    incrementer.estrelinhas = award;

    notificationRepository.createNotification(
      ctx.user.id,
      'commands:notificações.notifications.finished-daily',
      { price: award, count: finishedDailies },
    );
  }

  await userRepository.updateUserWithSpecialData(ctx.user.id, { $set: setter, $inc: incrementer });
};

export default { useCommand };
