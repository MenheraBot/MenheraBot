import { Users } from '@structures/DatabaseCollections';
import { IUserSchema } from '@utils/Types';

/* eslint-disable no-underscore-dangle */
export default class GiveRepository {
  constructor(private userModal: typeof Users) {}

  async _give(
    field: keyof IUserSchema,
    fromID: string,
    toID: string,
    value: number,
  ): Promise<void> {
    await this.userModal.updateOne({ id: fromID }, { $inc: { [field]: -value } });
    await this.userModal.updateOne({ id: toID }, { $inc: { [field]: value } });
  }

  async giveStars(fromID: string, toID: string, value: number): Promise<void> {
    return this._give('estrelinhas', fromID, toID, value);
  }

  async giveGiants(fromID: string, toID: string, value: number): Promise<void> {
    return this._give('giants', fromID, toID, value);
  }

  async giveArchangel(fromID: string, toID: string, value: number): Promise<void> {
    return this._give('archangels', fromID, toID, value);
  }

  async giveDemons(fromID: string, toID: string, value: number): Promise<void> {
    return this._give('demons', fromID, toID, value);
  }

  async giveAngels(fromID: string, toID: string, value: number): Promise<void> {
    return this._give('angels', fromID, toID, value);
  }

  async giveDemigods(fromID: string, toID: string, value: number): Promise<void> {
    return this._give('demigods', fromID, toID, value);
  }

  async giveGods(fromID: string, toID: string, value: number): Promise<void> {
    return this._give('gods', fromID, toID, value);
  }
}
