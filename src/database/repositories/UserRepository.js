module.exports = class UserRepository {
  constructor(userModal) {
    this.userModal = userModal;
  }

  async findOrCreate(userID) {
    const result = await this.userModal.findOne({ id: userID });
    if (result) return result;

    return this.userModal.create({ id: userID });
  }

  async delete(userID) {
    return this.userModal.deleteOne({ id: userID });
  }

  async find(userID) {
    return this.userModal.findOne({ id: userID });
  }

  async create(userID) {
    return this.userModal.create({ id: userID });
  }

  findAfkByIDs(ids) {
    return this.userModal.find({ id: { $in: ids }, afk: true });
  }
};
