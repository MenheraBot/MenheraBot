import { BigString } from 'discordeno/types';
import { negate } from '../../utils/miscUtils';
import userRepository from './userRepository';

const addStars = async (userId: BigString, value: number): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, { $inc: { estrelinhas: value } });
};

const removeStars = async (userId: BigString, value: number): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, { $inc: { estrelinhas: negate(value) } });
};

const setStars = async (userId: BigString, value: number): Promise<void> => {
  await userRepository.updateUser(userId, { estrelinhas: value });
};

export default { addStars, removeStars, setStars };
