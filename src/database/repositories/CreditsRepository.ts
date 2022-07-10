import { Credits } from '@database/Collections';
import { CreditsSchema } from '@custom_types/Menhera';
import { MayNotExists } from '@utils/Util';
import { Redis } from 'ioredis';
import StarRepository from './StarRepository';

export default class CreditsRepository {
  constructor(
    private creditsModel: typeof Credits,
    private redisClient: MayNotExists<Redis>,
    private startRepository: StarRepository,
  ) {}

  async registerTheme(themeId: number, ownerId: string, royalty: number): Promise<void> {
    await this.creditsModel.create({
      ownerId,
      themeId,
      royalty,
      totalEarned: 0,
      registeredAt: Date.now(),
    });
  }

  async findCreditsInfo(themeId: number): Promise<CreditsSchema | null> {
    return this.creditsModel.findOne({ themeId });
  }

  async getDesignerThemes(userId: string): Promise<CreditsSchema[]> {
    return this.creditsModel.find({ ownerId: userId });
  }

  async addParticipation(themeId: number, value: number): Promise<void> {
    const owner = (await this.creditsModel.findOneAndUpdate(
      { themeId },
      { $inc: { totalEarned: value, timesSold: 1 } },
    )) as CreditsSchema;
    await this.startRepository.add(owner.ownerId, value);
  }

  async getThemesOwnerId(themeIds: number[]): Promise<{ themeId: number; ownerId: string }[]> {
    return this.creditsModel
      .find({ themeId: { $in: themeIds } }, ['ownerId', 'themeId'])
      .then((res) => res.map((a) => ({ themeId: a.themeId, ownerId: a.ownerId })));
  }

  async getThemeInfo(themeId: number): Promise<CreditsSchema> {
    if (this.redisClient) {
      const result = await this.redisClient.get(`credits:${themeId}`);
      if (result) return JSON.parse(result);
    }

    const info = (await this.findCreditsInfo(themeId)) as CreditsSchema;

    if (this.redisClient)
      this.redisClient.set(
        `credits:${themeId}`,
        JSON.stringify({
          themeId: info.themeId,
          ownerId: info.ownerId,
          registeredAt: info.registeredAt,
          totalEarned: info.totalEarned,
        }),
      );

    return info;
  }
}
