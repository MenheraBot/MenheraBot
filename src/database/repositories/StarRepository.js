module.exports = class StarRepository {
  constructor(userModal) {
    this.userModal = userModal;
  }

  async add(userID, value) {
    await this.userModal.updateOne({ id: userID }, { $inc: { estrelinahs: value } });
  }

  async remove(userID, value) {
    const invertedValue = value * -1;
    await this.userModal.updateOne({ id: userID }, { $inc: { estrelinahs: invertedValue } });
  }

  async set(userID, value) {
    await this.userModal.updateOne({ id: userID }, { $set: { estrelinhas: value } });
  }
};
