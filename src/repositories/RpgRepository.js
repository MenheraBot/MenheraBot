const { Rpg } = require('../structures/DatabaseConnection');

module.exports = class RpgRepository {
  static async findByIdOrCreate(userID) {
    const result = await Rpg.findById(userID);
    if (result) return result;

    return Rpg.create({ _id: userID });
  }

};
