const { Rpg } = require('../structures/DatabaseConnection');

module.exports = class RpgRepository {
  static async findByIdOrCreate(userID) {
    const result = await Rpg.findById(userID);
    if (result) return result;

    const newRpgUser = await Rpg.create({ _id: userID });
    return newRpgUser;
  }

  /*  static async remove(userID, value) {
    const invertedValue = value * -1;
    await Users.updateOne({ id: userID }, { $inc: { estrelinahs: invertedValue } });
  }

  static async set(userID, value) {
    await Users.updateOne({ id: userID }, { $set: { estrelinhas: value } });
  } */
};
