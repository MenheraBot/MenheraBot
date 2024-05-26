import userRepository from '../../database/repositories/userRepository';
import { DatabaseUserSchema } from '../../types/database';
import { calculateUserDailies } from './calculateUserDailies';

import { DatabaseDaily } from './types';

const getUserDailies = async (user: DatabaseUserSchema): Promise<DatabaseDaily[]> => {
  const todayDayId = new Date().getDate();
  const isUpToDate = user.dailyDayId === todayDayId;

  if (isUpToDate) return user.dailies;

  const newDailies = calculateUserDailies();

  await userRepository.updateUser(user.id, { dailies: newDailies, dailyDayId: todayDayId });

  return newDailies;
};

export { getUserDailies };
