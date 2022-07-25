import { usersModel } from '../collections';
import userRepository from './userRepository';

const executeMamar = async (fromUserId: bigint, toUserId: bigint): Promise<void> => {
  await userRepository.updateUser(fromUserId, { $inc: { mamou: 1 } });
  await usersModel.updateOne({ id: toUserId }, { $inc: { mamado: 1 } }, { upsert: true });
};

export default { executeMamar };
