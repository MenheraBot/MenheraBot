import { Credits } from '@structures/DatabaseCollections';

export default class CreditsRepository {
  constructor(private creditsModel: typeof Credits) {}

  async registerTheme(themeId: number, ownerId: string, royalty: number): Promise<void> {
    await this.creditsModel.create({
      ownerId,
      themeId,
      royalty,
      totalEarned: 0,
      registeredAt: Date.now(),
    });
  }
}
