module.exports = class RpgRepository {
  constructor(rpgModal) {
    this.modal = rpgModal;
  }

  async findByIdOrCreate(userID) {
    const result = await this.rpgModal.findById(userID);
    if (result) return result;

    return this.rpgModal.create({ _id: userID });
  }
};
