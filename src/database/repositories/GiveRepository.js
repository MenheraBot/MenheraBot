/* eslint-disable no-underscore-dangle */
module.exports = class GiveRepository {
  constructor(userModal) {
    this.userModal = userModal;
  }

  async _give(field, fromID, toID, value) {
    await this.userModal.updateOne({ id: fromID }, { $inc: { [field]: -value } });
    await this.userModal.updateOne({ id: toID }, { $inc: { [field]: value } });
  }

  giveStars(fromID, toID, value) {
    return this._give('estrelinhas', fromID, toID, value);
  }

  giveDemons(fromID, toID, value) {
    return this._give('caçados', fromID, toID, value);
  }

  giveAngels(fromID, toID, value) {
    return this._give('anjos', fromID, toID, value);
  }

  giveDemigods(fromID, toID, value) {
    return this._give('semideuses', fromID, toID, value);
  }

  giveGods(fromID, toID, value) {
    return this._give('deuses', fromID, toID, value);
  }
};
