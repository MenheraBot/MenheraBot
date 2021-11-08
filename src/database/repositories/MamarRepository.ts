import UserRepository from './UserRepository';

export default class MamarRepository {
  constructor(private userRepository: UserRepository) {}

  async mamar(fromUserID: string, toUserID: string): Promise<void> {
    await this.userRepository.update(fromUserID, { $inc: { mamou: 1 }, lastCommandAt: Date.now() });
    await this.userRepository.update(toUserID, { $inc: { mamadas: 1 } });
  }
}
