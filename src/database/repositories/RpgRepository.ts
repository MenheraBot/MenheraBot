import { Rpg } from '@structures/DatabaseCollections';
import { IBasicData, IEnochiaShop, IRpgUserSchema } from '@structures/roleplay/Types';
import { Redis } from 'ioredis';
import { Document, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import Util from '@utils/Util';

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

  async getUserEnochiaMart(userID: string, userShop: IEnochiaShop): Promise<IEnochiaShop> {
    if (this.redisClient) {
      const cachedShop = await this.redisClient.get(`enochia_shop:${userID}`);
      if (cachedShop) return JSON.parse(cachedShop);

      await this.redisClient.setex(
        `enochia_shop:${userID}`,
        Util.getSecondsToTheEndOfDay(),
        JSON.stringify(userShop),
      );
    }
    return userShop;
  }

  async editUser(
    userID: string,
    query: UpdateQuery<IRpgUserSchema> | UpdateWithAggregationPipeline,
  ): Promise<void> {
    await this.rpgModal.updateOne({ id: userID }, query);
  }
}
