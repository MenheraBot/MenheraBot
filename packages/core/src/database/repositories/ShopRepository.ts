import { Users } from '@database/Collections';
import { AvailableThemeTypes, HuntingTypes, IColor } from '@custom_types/Menhera';
import { negate } from '@utils/Util';
import ThemeRepository from './ThemeRepository';
import CreditsRepository from './CreditsRepository';

export default class ShopRepository {
  constructor(
    private userModal: typeof Users,
    private themeRepository: ThemeRepository,
    private creditsRepository: CreditsRepository,
  ) {}

  async buyTheme(
    userID: string,
    themeID: number,
    price: number,
    themeType: AvailableThemeTypes,
    royalty: number,
  ): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      { $inc: { estrelinhas: negate(price) }, lastCommandAt: Date.now() },
    );

    await this.creditsRepository.addParticipation(themeID, Math.floor((royalty / 100) * price));

    switch (themeType) {
      case 'profile':
        await this.themeRepository.addProfileTheme(userID, themeID);
        break;

      case 'cards':
        await this.themeRepository.addCardsTheme(userID, themeID);
        break;

      case 'card_background':
        await this.themeRepository.addCardBackgroundTheme(userID, themeID);
        break;

      case 'table':
        await this.themeRepository.addTableTheme(userID, themeID);
        break;
    }
  }

  async buyItem(userID: string, itemID: number, price: number): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      {
        $inc: { estrelinhas: negate(price) },
        $push: { inventory: { id: itemID } },
        lastCommandAt: Date.now(),
      },
    );
  }

  async buyRoll(userID: string, amount: number, price: number): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      {
        $inc: { rolls: amount, estrelinhas: negate(price) },
        lastCommandAt: Date.now(),
      },
    );
  }

  async buyColor(userID: string, price: number, color: IColor): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      {
        $inc: { estrelinhas: negate(price) },
        $push: { colors: color },
        lastCommandAt: Date.now(),
      },
    );
  }

  async sellHunt(
    userID: string,
    huntType: HuntingTypes,
    amount: number,
    profit: number,
  ): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      {
        $inc: { [huntType]: negate(amount), estrelinhas: profit },
        lastCommandAt: Date.now(),
      },
    );
  }
}
