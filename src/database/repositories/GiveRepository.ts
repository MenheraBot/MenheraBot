import { Users } from '@structures/DatabaseCollections';

/* eslint-disable no-underscore-dangle */
export default class GiveRepository {
  constructor(private userModal: typeof Users) {
    this.userModal = userModal;
  }

  async _give(field: string, fromID: string, toID: string, value: number) {
    await this.userModal.updateOne({ id: fromID }, { $inc: { [field]: -value } });
    await this.userModal.updateOne({ id: toID }, { $inc: { [field]: value } });
  }

  giveStars(fromID: string, toID: string, value: number) {
    return this._give('estrelinhas', fromID, toID, value);
  }

  giveDemons(fromID: string, toID: string, value: number) {
    return this._give('caçados', fromID, toID, value);
  }

  giveAngels(fromID: string, toID: string, value: number) {
    return this._give('anjos', fromID, toID, value);
  }

  giveDemigods(fromID: string, toID: string, value: number) {
    return this._give('semideuses', fromID, toID, value);
  }

  giveGods(fromID: string, toID: string, value: number) {
    return this._give('deuses', fromID, toID, value);
  }
}
