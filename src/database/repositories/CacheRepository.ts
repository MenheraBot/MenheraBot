import { IGuildSchema } from '@utils/Types';
import { Redis } from 'ioredis';
import { Document } from 'mongoose';
import GuildsRepository from './GuildsRepository';

export default class CacheRepository {
  constructor(private redisClient: Redis | null, private guildRepository: GuildsRepository) {}

  async fetchGuild(guildID: string): Promise<IGuildSchema | (IGuildSchema & Document)> {
    if (this.redisClient) {
      const guildData = await this.redisClient.get(`guild:${guildID}`);
      if (guildData) return JSON.parse(guildData);
    }
    const guildDataFromMongo = await this.guildRepository.findOrCreate(guildID);

    if (this.redisClient)
      await this.redisClient.set(
        `guild:${guildID}`,
        JSON.stringify({
          prefix: guildDataFromMongo.prefix,
          lang: guildDataFromMongo.lang,
          blockedChannels: guildDataFromMongo.blockedChannels,
          disabledCommands: guildDataFromMongo.disabledCommands,
        }),
      );

    return guildDataFromMongo;
  }

  async updateGuild(guildID: string, update: IGuildSchema): Promise<void> {
    if (this.redisClient) {
      const stringedObject = JSON.stringify(update);
      await this.redisClient.set(`guild:${guildID}`, stringedObject);
    }
    await this.guildRepository.update(guildID, update);
  }
}
