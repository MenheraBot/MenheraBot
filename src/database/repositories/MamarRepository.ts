import UserRepository from './UserRepository';

export default class MamarRepository {
  constructor(private userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async mamar(fromUserID: string, toUserID: string, qty = 1) {
    const fromUser = await this.userRepository.findOrCreate(fromUserID);
    const toUser = await this.userRepository.findOrCreate(toUserID);

    toUser.mamadas += qty;
    fromUser.mamou += qty;

    await toUser.save();
    await fromUser.save();

    return { toUser, fromUser };
  }
}
