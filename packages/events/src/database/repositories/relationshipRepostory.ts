import { UserIdType } from '../../types/database';
import userRepository from './userRepository';

const executeMamar = async (fromUserId: UserIdType, toUserId: UserIdType): Promise<void> => {
  userRepository.updateUserWithSpecialData(fromUserId, { $inc: { mamou: 1 } });
  userRepository.updateUserWithSpecialData(toUserId, { $inc: { mamado: 1 } });
};

const executeUntrisal = async (
  firstUser: UserIdType,
  secondUser: UserIdType,
  thirdUser: UserIdType,
): Promise<void> => {
  await userRepository.multiUpdateUsers([`${firstUser}`, `${secondUser}`, `${thirdUser}`], {
    trisal: [],
  });
};

const executeTrisal = async (
  firstUser: UserIdType,
  secondUser: UserIdType,
  thirdUser: UserIdType,
): Promise<void> => {
  await userRepository.multiUpdateUsers([`${firstUser}`, `${secondUser}`, `${thirdUser}`], {
    trisal: [`${firstUser}`, `${secondUser}`, `${thirdUser}`],
    lastCommandAt: Date.now(),
  });
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

const executeMarry = async (userId: UserIdType, marryId: UserIdType): Promise<void> => {
  userRepository.updateUser(userId, {
    married: `${marryId}`,
    marriedAt: Date.now(),
    lastCommandAt: Date.now(),
  });

  userRepository.updateUser(marryId, {
    married: `${userId}`,
    marriedAt: Date.now(),
    lastCommandAt: Date.now(),
  });
};

export default { executeMamar, executeDivorce, executeTrisal, executeMarry, executeUntrisal };
