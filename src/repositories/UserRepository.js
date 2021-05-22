const { Users } = require('../structures/DatabaseConnection');

module.exports = class UserRepository {
  static async findOrCreate(userID) {
    const result = await Users.findOne({ id: userID });
    if (result) return result;

    return Users.create({ id: userID });
  }

  static async delete(userID) {
    const result = await Users.deleteOne({ id: userID });
    return result;
  }

  static async findAfkByIDs(ids) {
    const result = await Users.find({ id: { $in: ids }, afk: true });
    return result;
  }
};
