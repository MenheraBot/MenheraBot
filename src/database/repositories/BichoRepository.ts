import { MayNotExists } from '@utils/Util';
import { Redis } from 'ioredis';

interface RaffleRecord {
  date: number;
  sortedNumbers: number[][];
}

interface NextRaffle {
  date: number;
  totalBet: number;
}

export default class BichoRepository {
  constructor(private redisClient: Redis | null) {}

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
}
