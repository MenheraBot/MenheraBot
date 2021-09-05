import { Rpg } from '@structures/DatabaseCollections';
import {
  IBasicData,
  IEnochiaShop,
  IItemFile,
  IPartyData,
  IQuest,
  IQuestsFile,
  IRpgUserSchema,
} from '@structures/roleplay/Types';
import { Redis } from 'ioredis';
import { Document, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import Util from '@utils/Util';
import { resolveDailyQuests, resolveEnochiaMart } from '@structures/roleplay/Utils';

export default class RpgRepository {
  constructor(private rpgModal: typeof Rpg, private redisClient: Redis | null) {}

  async findUser(userID: string): Promise<(IRpgUserSchema & Document) | null> {
    return this.rpgModal.findOne({ id: userID });
  }

  async createUser(data: IBasicData): Promise<boolean> {
    return this.rpgModal
      .create(data)
      .then(() => true)
      .catch(() => false);
  }

  async getUserEnochiaMart(
    userID: string,
    userLevel: number,
    itemsFile: [string, IItemFile<boolean>][],
  ): Promise<IEnochiaShop> {
    if (this.redisClient) {
      const cachedShop = await this.redisClient.get(`enochia_shop:${userID}`);
      if (cachedShop) return JSON.parse(cachedShop);

      const userShop = resolveEnochiaMart(userLevel, itemsFile);

      await this.redisClient.setex(
        `enochia_shop:${userID}`,
        Util.getSecondsToTheEndOfDay(),
        JSON.stringify(userShop),
      );
      return userShop;
    }
    return resolveEnochiaMart(userLevel, itemsFile);
  }

  async getUserDailyQuests(
    userID: string,
    userLevel: number,
    questsFile: [string, IQuestsFile][],
  ): Promise<IQuest[] | null> {
    if (this.redisClient) {
      const cachedMissions = await this.redisClient.get(`daily_quests:${userID}`);
      if (cachedMissions) return JSON.parse(cachedMissions);

      const newUserQuests = resolveDailyQuests(userLevel, questsFile);

      await this.redisClient.setex(
        `daily_quests:${userID}`,
        Util.getSecondsToTheEndOfDay(),
        JSON.stringify(newUserQuests),
      );

      return newUserQuests;
    }
    return null;
  }

  async editUser(
    userID: string,
    query: UpdateQuery<IRpgUserSchema> | UpdateWithAggregationPipeline,
  ): Promise<void> {
    await this.rpgModal.updateOne({ id: userID }, query);
  }

  async getUserParty(userID: string): Promise<IPartyData | null> {
    if (!this.redisClient) return null;
    const party = await this.redisClient.get(`party:${userID}`);
    if (!party) return null;

    return JSON.parse(party);
  }

  async createParty(userID: string, party: string[], leader: string): Promise<void> {
    if (!this.redisClient) return;
    await this.redisClient.set(`party:${userID}`, JSON.stringify({ leader, party }));
  }

  async deleteParty(userID: string): Promise<void> {
    if (!this.redisClient) return;
    await this.redisClient.del(`party:${userID}`);
  }
}
