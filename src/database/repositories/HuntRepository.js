module.exports = class HuntRepository {
  constructor(userModal) {
    this.userModal = userModal;
  }

  async huntDemon(userID, value, cooldown) {
    await this.userModal.updateOne({ id: userID }, { $inc: { caçados: value }, caçarTime: cooldown });
  }

  async huntAngel(userID, value, cooldown) {
    await this.userModal.updateOne({ id: userID }, { $inc: { anjos: value }, caçarTime: cooldown });
  }

  async huntDemigod(userID, value, cooldown) {
    await this.userModal.updateOne({ id: userID }, { $inc: { semideuses: value }, caçarTime: cooldown });
  }

  async huntGod(userID, value, cooldown) {
    await this.userModal.updateOne({ id: userID }, { $inc: { deuses: value }, caçarTime: cooldown });
  }
};
