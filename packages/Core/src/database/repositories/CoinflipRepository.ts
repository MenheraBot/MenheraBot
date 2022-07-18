import StarRepository from './StarRepository';

export default class CoinflipRepository {
  constructor(private starRepository: StarRepository) {}

  async coinflip(winnerId: string, loserId: string, value: number): Promise<void> {
    await this.starRepository.add(winnerId, value);
    await this.starRepository.remove(loserId, value);
  }
}
