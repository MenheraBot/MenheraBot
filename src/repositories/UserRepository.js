const { Users } = require('../structures/DatabaseConnection');

module.exports = class UserRepository {
  /**
    * @deprecated This funcion is not used anymore, use find and create instead
    *
    * @param {string} userID The id of the user about
    *
    */

  static async findOrCreate(userID) {
    const result = await Users.findOne({ id: userID });
    if (result) return result;

    return Users.create({ id: userID });
  }

  static async delete(userID) {
    return Users.deleteOne({ id: userID });
  }

  static async find(userID) {
    return Users.findOne({ id: userID });
  }

  static async create(userID) {
    return Users.create({ id: userID });
  }

  static findAfkByIDs(ids) {
    return Users.find({ id: { $in: ids }, afk: true });
  }
};
