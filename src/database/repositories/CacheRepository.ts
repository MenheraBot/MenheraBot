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

  async enableCommandInGuild(guildID: string, commandName: string): Promise<void> {
    if (this.redisClient) {
      const dataAtual = await this.redisClient.get(`guild:${guildID}`);
      if (dataAtual) {
        const jsonData = JSON.parse(dataAtual);
        const index = jsonData.disabledCommands.indexOf(commandName);
        jsonData.disabledCommands.splice(index, 1);
        const afterChanges = JSON.stringify(jsonData);
        await this.redisClient.set(`guild:${guildID}`, afterChanges);
      }
    }
    await this.guildRepository.update(guildID, { $pull: { disabledCommands: commandName } });
  }

  async disableCommandInGuild(guildID: string, commandName: string): Promise<void> {
    if (this.redisClient) {
      const dataAtual = await this.redisClient.get(`guild:${guildID}`);
      if (dataAtual) {
        const jsonData = JSON.parse(dataAtual);
        jsonData.disabledCommands.push(commandName);
        const afterChanges = JSON.stringify(jsonData);
        await this.redisClient.set(`guild:${guildID}`, afterChanges);
      }
    }
    await this.guildRepository.update(guildID, { $push: { disabledCommands: commandName } });
  }

  async removeBlockedChannel(guildID: string, channelID: string): Promise<void> {
    if (this.redisClient) {
      const dataAtual = await this.redisClient.get(`guild:${guildID}`);
      if (dataAtual) {
        const jsonData = JSON.parse(dataAtual);
        const index = jsonData.blockedChannels.indexOf(channelID);
        jsonData.blockedChannels.splice(index, 1);
        const afterChanges = JSON.stringify(jsonData);
        await this.redisClient.set(`guild:${guildID}`, afterChanges);
      }
    }
    await this.guildRepository.update(guildID, { $pull: { blockedChannels: channelID } });
  }

  async addBlockedChannel(guildID: string, channelID: string): Promise<void> {
    if (this.redisClient) {
      const dataAtual = await this.redisClient.get(`guild:${guildID}`);
      if (dataAtual) {
        const jsonData = JSON.parse(dataAtual);
        jsonData.blockedChannels.push(channelID);
        const afterChanges = JSON.stringify(jsonData);
        await this.redisClient.set(`guild:${guildID}`, afterChanges);
      }
    }
    await this.guildRepository.update(guildID, { $push: { blockedChannels: channelID } });
  }

  async updateGuildPrefix(guildID: string, prefix: string): Promise<void> {
    if (this.redisClient) {
      const dataAtual = await this.redisClient.get(`guild:${guildID}`);
      if (dataAtual) {
        const jsonData = JSON.parse(dataAtual);
        jsonData.prefix = prefix;
        const afterChanges = JSON.stringify(jsonData);
        await this.redisClient.set(`guild:${guildID}`, afterChanges);
      }
    }

    await this.guildRepository.update(guildID, { prefix });
  }

  async updateGuildLanguage(guildID: string, lang: string): Promise<void> {
    if (this.redisClient) {
      const dataAtual = await this.redisClient.get(`guild:${guildID}`);
      if (dataAtual) {
        const jsonData = JSON.parse(dataAtual);
        jsonData.lang = lang;
        const afterChanges = JSON.stringify(jsonData);
        await this.redisClient.set(`guild:${guildID}`, afterChanges);
      }
    }

    this.guildRepository.updateLang(guildID, lang);
  }
}
