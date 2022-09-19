import { BigString } from 'discordeno/types';
import userRepository from './userRepository';

const addStars = async (userId: BigString, value: number): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, { $inc: { estrelinhas: value } });
};

const removeStars = async (userId: BigString, value: number): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, { $inc: { estrelinhas: value * -1 } });
};

const setStars = async (userId: BigString, value: number): Promise<void> => {
  await userRepository.updateUser(userId, { estrelinhas: value });
};

export default { addStars, removeStars, setStars };
