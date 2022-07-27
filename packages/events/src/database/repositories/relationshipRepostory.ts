import { UserIdType } from '../../types/database';
import { usersModel } from '../collections';
import userRepository from './userRepository';

const executeMamar = async (fromUserId: UserIdType, toUserId: UserIdType): Promise<void> => {
  await userRepository.updateUser(fromUserId, { $inc: { mamou: 1 } });
  await usersModel.updateOne({ id: toUserId }, { $inc: { mamado: 1 } }, { upsert: true });
};

const executeDivorce = async (userId: UserIdType, marryId: UserIdType): Promise<void> => {
  userRepository.updateUser(userId, {
    married: null,
    marriedDate: null,
    marriedAt: null,
    lastCommandAt: Date.now(),
  });

  userRepository.updateUser(marryId, {
    married: null,
    marriedDate: null,
    marriedAt: null,
    lastCommandAt: Date.now(),
  });
};

export default { executeMamar, executeDivorce };
