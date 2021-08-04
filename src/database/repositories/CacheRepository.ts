import { IAfkUserData, ICmdSchema, IGuildSchema } from '@utils/Types';
import { Redis } from 'ioredis';
import { Document } from 'mongoose';
import CmdRepository from './CmdsRepository';
import GuildsRepository from './GuildsRepository';
import UserRepository from './UserRepository';

export default class CacheRepository {
  constructor(
    private redisClient: Redis | null,
    private guildRepository: GuildsRepository,
    private cmdRepository: CmdRepository,
    private userRepository: UserRepository,
  ) {}

  async fetchAfk(userID: string): Promise<null | IAfkUserData> {
    if (this.redisClient) {
      const afkData = await this.redisClient.get(`afk:${userID}`);
      if (afkData) return JSON.parse(afkData);
    }
    const afkDataFromMongo = await this.userRepository.find(userID);
    if (!afkDataFromMongo) return null;

    if (this.redisClient) {
      await this.redisClient.setex(
        `afk:${userID}`,
        3600,
        JSON.stringify({
          afk: afkDataFromMongo.afk,
          afkGuild: afkDataFromMongo.afkGuild,
          afkReason: afkDataFromMongo.afkReason,
        }),
      );
    }

    return {
      afk: afkDataFromMongo.afk,
      afkGuild: afkDataFromMongo.afkGuild,
      afkReason: afkDataFromMongo.afkReason,
    };
  }

  async updateAfk(userID: string, afkData: IAfkUserData): Promise<void> {
    if (this.redisClient) {
      const stringedObject = JSON.stringify(afkData);
      await this.redisClient.setex(`afk:${userID}`, 3600, stringedObject);
    }
    await this.userRepository.update(userID, afkData);
  }

  async fetchCommand(commandName: string): Promise<ICmdSchema | (ICmdSchema & Document) | null> {
    if (this.redisClient) {
      const commandData = await this.redisClient.get(`command:${commandName}`);
      if (commandData) return JSON.parse(commandData);
    }
    const commandDataFromMongo = await this.cmdRepository.findByName(commandName);
    if (!commandDataFromMongo) return null;

    if (this.redisClient) {
      await this.redisClient.set(
        `command:${commandName}`,
        JSON.stringify({
          maintenance: commandDataFromMongo.maintenance,
          maintenanceReason: commandDataFromMongo.maintenanceReason,
        }),
      );
    }

    return commandDataFromMongo;
  }

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

  async updateCommand(commandName: string, update: ICmdSchema): Promise<void> {
    if (this.redisClient) {
      const stringedObject = JSON.stringify(update);
      await this.redisClient.set(`command:${commandName}`, stringedObject);
    }
  }
}
