import { Themes } from '@structures/DatabaseCollections';
import {
  AvailableProfilesThemes,
  IUserThemesSchema,
  IProfileTheme,
  AvailableCardThemes,
  ICardsTheme,
  AvailableTableThemes,
  ITableTheme,
  AvailableCardBackgroundThemes,
  ICardBackgroudTheme,
} from '@utils/Types';
import { getThemeById, MayNotExists } from '@utils/Util';
import { Redis } from 'ioredis';

export default class ThemeRepository {
  constructor(private themesModal: typeof Themes, private redisClient: MayNotExists<Redis>) {}

  async findOrCreate(
    userId: string,
    projection: Array<keyof IUserThemesSchema> = [],
  ): Promise<IUserThemesSchema> {
    const result = await this.themesModal.findOne({ id: userId }, projection);

    if (!result) return this.themesModal.create({ id: userId });

    return result;
  }

  async addTableTheme(userId: string, tableId: number): Promise<void> {
    await this.themesModal.updateOne(
      { id: userId },
      { $push: { tableThemes: { id: tableId, aquiredAt: Date.now() } } },
    );
  }

  async addCardsTheme(userId: string, cardId: number): Promise<void> {
    await this.themesModal.updateOne(
      { id: userId },
      { $push: { cardsThemes: { id: cardId, aquiredAt: Date.now() } } },
    );
  }

  async addCardBackgroundTheme(userId: string, cardBackgroundId: number): Promise<void> {
    await this.themesModal.updateOne(
      {
        id: userId,
      },
      { $push: { cardsBackgroundThemes: { id: cardBackgroundId, aquiredAt: Date.now() } } },
    );
  }

  async addProfileTheme(userId: string, profileId: number): Promise<void> {
    await this.themesModal.updateOne(
      { id: userId },
      { $push: { profileThemes: { id: profileId, aquiredAt: Date.now() } } },
    );
  }

  async setTableTheme(userId: string, tableId: number): Promise<void> {
    await this.themesModal.updateOne({ id: userId }, { selectedTableTheme: tableId });

    if (this.redisClient) this.redisClient.setex(`table_theme:${userId}`, 3600, tableId);
  }

  async setCardsTheme(userId: string, cardId: number): Promise<void> {
    await this.themesModal.updateOne({ id: userId }, { selectedCardTheme: cardId });

    if (this.redisClient) this.redisClient.setex(`card_theme:${userId}`, 3600, cardId);
  }

  async setCardBackgroundTheme(userId: string, cardBackgroundId: number): Promise<void> {
    await this.themesModal.updateOne(
      {
        id: userId,
      },
      {
        selectedCardBackgroundTheme: cardBackgroundId,
      },
    );

    if (this.redisClient)
      this.redisClient.setex(`card_background_theme:${userId}`, 3600, cardBackgroundId);
  }

  async setProfileTheme(userId: string, profileId: number): Promise<void> {
    await this.themesModal.updateOne({ id: userId }, { selectedProfileTheme: profileId });

    if (this.redisClient) this.redisClient.setex(`profile_theme:${userId}`, 3600, profileId);
  }

  async getTableTheme(userId: string): Promise<AvailableTableThemes> {
    if (this.redisClient) {
      const theme = await this.redisClient.get(`table_theme:${userId}`);
      if (theme) return getThemeById<ITableTheme>(Number(theme)).data.theme;
    }

    const theme = await this.findOrCreate(userId, ['selectedTableTheme']);

    if (this.redisClient)
      this.redisClient.setex(`table_theme:${userId}`, 3600, theme.selectedTableTheme);

    return getThemeById<ITableTheme>(theme.selectedTableTheme).data.theme;
  }

  async getCardsTheme(userId: string): Promise<AvailableCardThemes> {
    if (this.redisClient) {
      const theme = await this.redisClient.get(`card_theme:${userId}`);
      if (theme) return getThemeById<ICardsTheme>(Number(theme)).data.theme;
    }

    const theme = await this.findOrCreate(userId, ['selectedCardTheme']);

    if (this.redisClient)
      this.redisClient.setex(`card_theme:${userId}`, 3600, theme.selectedCardTheme);

    return getThemeById<ICardsTheme>(theme.selectedCardTheme).data.theme;
  }

  async getProfileTheme(userId: string): Promise<AvailableProfilesThemes> {
    if (this.redisClient) {
      const theme = await this.redisClient.get(`profile_theme:${userId}`);
      if (theme) return getThemeById<IProfileTheme>(Number(theme)).data.theme;
    }

    const theme = await this.findOrCreate(userId, ['selectedProfileTheme']);

    if (this.redisClient)
      this.redisClient.setex(`profile_theme:${userId}`, 3600, theme.selectedProfileTheme);

    return getThemeById<IProfileTheme>(theme.selectedProfileTheme).data.theme;
  }

  async getCardBackgroundTheme(userId: string): Promise<AvailableCardBackgroundThemes> {
    if (this.redisClient) {
      const theme = await this.redisClient.get(`card_background_theme:${userId}`);
      if (theme) return getThemeById<ICardBackgroudTheme>(Number(theme)).data.theme;
    }

    const theme = await this.findOrCreate(userId, ['selectedCardBackgroundTheme']);

    if (this.redisClient)
      this.redisClient.setex(`profile_theme:${userId}`, 3600, theme.selectedCardBackgroundTheme);

    return getThemeById<ICardBackgroudTheme>(theme.selectedCardBackgroundTheme).data.theme;
  }
}
