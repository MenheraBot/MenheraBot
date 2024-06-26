import userRepository from '../../database/repositories/userRepository';
import { DatabaseUserSchema } from '../../types/database';
import { calculateUserDailies } from './calculateUserDailies';

import { DatabaseDaily } from './types';

const getUserDailies = async (user: DatabaseUserSchema): Promise<DatabaseDaily[]> => {
  const todayDayId = new Date().getDate();
  const isUpToDate = user.dailyDayId === todayDayId && user.dailies.every((a) => a.id >= 20);

  if (isUpToDate) return user.dailies;

  const newDailies = calculateUserDailies();

  const updateData = { dailies: newDailies, dailyDayId: todayDayId };

  user.dailies = updateData.dailies;
  user.dailyDayId = updateData.dailyDayId;

  await userRepository.updateUser(user.id, updateData);

  return newDailies;
};

export { getUserDailies };
