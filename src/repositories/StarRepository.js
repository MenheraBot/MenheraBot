const { Users } = require('../structures/DatabaseCollections');

module.exports = class StarRepository {
  static async add(userID, value) {
    await Users.updateOne({ id: userID }, { $inc: { estrelinahs: value } });
  }

  static async remove(userID, value) {
    const invertedValue = value * -1;
    await Users.updateOne({ id: userID }, { $inc: { estrelinahs: invertedValue } });
  }

  static async set(userID, value) {
    await Users.updateOne({ id: userID }, { $set: { estrelinhas: value } });
  }
};
