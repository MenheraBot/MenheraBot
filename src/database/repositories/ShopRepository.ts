import { Users } from '@structures/DatabaseCollections';
import { HuntingTypes, IColor } from '@utils/Types';
import { negate } from '@utils/Util';

export default class ShopRepository {
  constructor(private userModal: typeof Users) {}

  async buyItem(userID: string, itemID: number, price: number): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      {
        $inc: { estrelinhas: negate(price) },
        $push: { inventory: { id: itemID } },
      },
    );
  }

  async buyRoll(userID: string, amount: number, price: number): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      {
        $inc: { rolls: amount, estrelinhas: negate(price) },
      },
    );
  }

  async buyColor(userID: string, price: number, color: IColor): Promise<void> {
    await this.userModal.updateOne(
      { id: userID },
      {
        $inc: { estrelinhas: negate(price) },
        $push: { colors: color },
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
      },
    );
  }
}
