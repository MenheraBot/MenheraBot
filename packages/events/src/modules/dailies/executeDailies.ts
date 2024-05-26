import notificationRepository from '../../database/repositories/notificationRepository';
import userRepository from '../../database/repositories/userRepository';
import { DatabaseUserSchema } from '../../types/database';
import { FINISHED_DAILY_AWARD, getDailyById } from './dailies';
import { getUserDailies } from './getUserDailies';
import { Daily, DatabaseDaily, WinBetDaily } from './types';

const executeDailies = async (
  user: DatabaseUserSchema,
  toIncrease: number,
  shouldExecute: (dailyData: Daily) => boolean,
): Promise<void> => {
  const userDailies = getUserDailies(user);

  const setter: Record<string, DatabaseDaily> = {};
  const incrementer: Partial<DatabaseUserSchema> = {};

  let needUpdate = false;
  let finishedDailies = 0;

  userDailies.forEach((daily, i) => {
    const dailyData = getDailyById(daily.id);

    if (!shouldExecute(dailyData)) return;
    if (daily.has >= daily.need) return;

    needUpdate = true;
    daily.has += toIncrease;

    setter[`dailies.${i}`] = daily;

    if (daily.has > daily.need) daily.has = daily.need;
    if (daily.has >= daily.need) finishedDailies += 1;
  }, []);

  if (!needUpdate) return;

  if (finishedDailies > 0) {
    const award = finishedDailies * FINISHED_DAILY_AWARD;
    incrementer.estrelinhas = award;

    notificationRepository.createNotification(
      user.id,
      'commands:notificações.notifications.finished-daily',
      { price: award, count: finishedDailies },
    );
  }

  await userRepository.updateUserWithSpecialData(user.id, { $set: setter, $inc: incrementer });
};

const useCommand = async (user: DatabaseUserSchema, commandName: string): Promise<void> => {
  const shouldExecute = (dailyData: Daily) => {
    return dailyData.type === 'use_command' && dailyData.name === commandName;
  };

  await executeDailies(user, 1, shouldExecute);
};

const winStarsInBet = async (user: DatabaseUserSchema, amount: number): Promise<void> => {
  const shouldExecute = (dailyData: Daily) => {
    return dailyData.type === 'win_stars_in_bets';
  };

  await executeDailies(user, amount, shouldExecute);
};

const winBet = async (user: DatabaseUserSchema, bet: WinBetDaily['bet']): Promise<void> => {
  const shouldExecute = (dailyData: Daily) => {
    return dailyData.type === 'win_bet' && dailyData.bet === bet;
  };

  await executeDailies(user, 1, shouldExecute);
};

export default { useCommand, winBet, winStarsInBet };
