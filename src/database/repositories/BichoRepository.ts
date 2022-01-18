import { MayNotExists } from '@utils/Util';
import { Redis } from 'ioredis';
import StarRepository from './StarRepository';

interface RaffleRecord {
  date: number;
  sortedNumbers: number[][];
}

interface NextRaffle {
  date: number;
  totalBet: number;
}

export default class BichoRepository {
  constructor(private redisClient: Redis | null, private startRepository: StarRepository) {}

  async createBet(userID: string, bet: number, select: string): Promise<void> {
    await this.startRepository.remove(userID, bet);
    const nextRaffle = await this.getNextRaffleDate();
    if (nextRaffle)
      this.setNextRaffleDate({ date: nextRaffle.date, totalBet: nextRaffle.totalBet + bet });

    // TODO:  CRIAR O REQUEST PRA NOVA BET

    console.log(select);
  }

  async getLastRaffle(): Promise<MayNotExists<RaffleRecord>> {
    if (!this.redisClient) return null;
    const data = await this.redisClient.get('last-bicho');
    if (!data) return null;
    return JSON.parse(data);
  }

  async getNextRaffleDate(): Promise<MayNotExists<NextRaffle>> {
    if (!this.redisClient) return null;
    const data = await this.redisClient.get('next-bicho');
    if (!data) return null;
    return JSON.parse(data);
  }

  async setNextRaffleDate(raffle: NextRaffle): Promise<void> {
    if (!this.redisClient) return;
    await this.redisClient.set('next-bicho', JSON.stringify(raffle));
  }
}
