import { Users } from '@structures/DatabaseCollections';

/* eslint-disable no-underscore-dangle */
export default class GiveRepository {
  constructor(private userModal: typeof Users) {
    this.userModal = userModal;
  }

  async _give(field: string, fromID: string, toID: string, value: number): Promise<void> {
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
    return this._give('arcanjos', fromID, toID, value);
  }

  async giveDemons(fromID: string, toID: string, value: number): Promise<void> {
    return this._give('caçados', fromID, toID, value);
  }

  async giveAngels(fromID: string, toID: string, value: number): Promise<void> {
    return this._give('anjos', fromID, toID, value);
  }

  async giveDemigods(fromID: string, toID: string, value: number): Promise<void> {
    return this._give('semideuses', fromID, toID, value);
  }

  async giveGods(fromID: string, toID: string, value: number): Promise<void> {
    return this._give('deuses', fromID, toID, value);
  }
}
