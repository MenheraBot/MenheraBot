import { IUserSchema } from '@utils/Types';
import UserRepository from './UserRepository';

export default class MamarRepository {
  constructor(private userRepository: UserRepository) {}

  async mamar(
    fromUserID: string,
    toUserID: string,
    qty = 1,
  ): Promise<{ toUser: IUserSchema; fromUser: IUserSchema }> {
    const fromUser = await this.userRepository.findOrCreate(fromUserID);
    const toUser = await this.userRepository.findOrCreate(toUserID);

    toUser.mamadas += qty;
    fromUser.mamou += qty;

    await toUser.save();
    await fromUser.save();

    return { toUser, fromUser };
  }
}
