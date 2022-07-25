import { UpdateQuery } from 'mongoose';

import { usersModel } from '../collections';
import { DatabaseUserSchema } from '../../types/database';

const updateUser = async (
  userId: bigint,
  query: UpdateQuery<DatabaseUserSchema>,
): Promise<void> => {
  await usersModel.updateOne({ id: userId }, { ...query, lastCommandAt: Date.now() });
};

export default { updateUser };
