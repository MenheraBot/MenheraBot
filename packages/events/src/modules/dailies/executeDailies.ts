import notificationRepository from '../../database/repositories/notificationRepository';
import userRepository from '../../database/repositories/userRepository';
import { ChatInputInteractionCommand } from '../../types/commands';
import { DatabaseUserSchema } from '../../types/database';
import { AvailablePlants } from '../fazendinha/types';
import { FINISHED_DAILY_AWARD, getDailyById } from './dailies';
import { getUserDailies } from './getUserDailies';
import { Daily, DatabaseDaily } from './types';

const executeDailies = async (
  user: DatabaseUserSchema,
  shouldExecute: (dailyData: Daily, specification?: string) => boolean,
  toIncrease = 1,
): Promise<void> => {
  const userDailies = await getUserDailies(user);

  const setter: Record<string, DatabaseDaily> = {};
  const incrementer: Partial<DatabaseUserSchema> = {};

  let needUpdate = false;
  let finishedDailies = 0;
  let availableForPrizeDailies = 0;

  userDailies.forEach((daily, i) => {
    const dailyData = getDailyById(daily.id);

    if (!shouldExecute(dailyData, daily.specification)) return;
    if (daily.has >= daily.need) return;

    needUpdate = true;
    daily.has += toIncrease;

    daily.has = parseFloat(daily.has.toFixed(1));

    setter[`dailies.${i}`] = daily;

    if (daily.has > daily.need) daily.has = daily.need;
    if (daily.has >= daily.need) {
      finishedDailies += 1;
      if (!daily.changed) availableForPrizeDailies += 1;
    }
  }, []);

  if (!needUpdate) return;

  if (finishedDailies > 0) {
    const award = availableForPrizeDailies * FINISHED_DAILY_AWARD;
    incrementer.estrelinhas = award;
    incrementer.completedDailies = finishedDailies;

    notificationRepository.createNotification(
      user.id,
      'commands:notificações.notifications.finished-daily',
      { price: award, count: finishedDailies },
    );
  }

  await userRepository.updateUserWithSpecialData(user.id, { $set: setter, $inc: incrementer });
};

const useCommand = async (
  user: DatabaseUserSchema,
  commandName: string,
  commandCategory: ChatInputInteractionCommand['category'],
): Promise<void> => {
  const shouldExecute = (dailyData: Daily, specification?: string) => {
    return (
      (dailyData.type === 'use_command' && specification === commandName) ||
      (dailyData.type === 'use_action_commands' && commandCategory === 'actions')
    );
  };

  await executeDailies(user, shouldExecute);
};

const winStarsInBet = async (user: DatabaseUserSchema, amount: number): Promise<void> => {
  const shouldExecute = (dailyData: Daily) => {
    return dailyData.type === 'win_stars_in_bets';
  };

  await executeDailies(user, shouldExecute, amount);
};

const winBet = async (user: DatabaseUserSchema, bet: 'roleta' | 'blackjack'): Promise<void> => {
  const shouldExecute = (dailyData: Daily, specification?: string) => {
    return dailyData.type === 'win_bet' && specification === bet;
  };

  await executeDailies(user, shouldExecute);
};

const justBet = async (user: DatabaseUserSchema, bet: 'bicho'): Promise<void> => {
  const shouldExecute = (dailyData: Daily, specification?: string) => {
    return dailyData.type === 'just_bet' && specification === bet;
  };

  await executeDailies(user, shouldExecute);
};

const announceProduct = async (user: DatabaseUserSchema): Promise<void> => {
  const shouldExecute = (dailyData: Daily) => {
    return dailyData.type === 'announce_product';
  };

  await executeDailies(user, shouldExecute);
};

const successOnHunt = async (user: DatabaseUserSchema, times: number): Promise<void> => {
  const shouldExecute = (dailyData: Daily) => {
    return dailyData.type === 'success_on_hunt';
  };

  await executeDailies(user, shouldExecute, times);
};

const harvestPlant = async (
  user: DatabaseUserSchema,
  type: AvailablePlants,
  weight: number,
): Promise<void> => {
  const shouldExecute = (dailyData: Daily, specification?: string) => {
    return dailyData.type === 'harvest_plants' && `${type}` === specification;
  };

  await executeDailies(user, shouldExecute, weight);
};

const finishDelivery = async (user: DatabaseUserSchema): Promise<void> => {
  const shouldExecute = (dailyData: Daily) => {
    return dailyData.type === 'finish_delivery';
  };

  await executeDailies(user, shouldExecute, 1);
};

export default {
  useCommand,
  justBet,
  winBet,
  harvestPlant,
  finishDelivery,
  winStarsInBet,
  announceProduct,
  successOnHunt,
};
