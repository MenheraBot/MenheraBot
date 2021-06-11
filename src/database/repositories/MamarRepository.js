module.exports = class MamarRepository {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async mamar(fromUserID, toUserID, qty = 1) {
    const fromUser = await this.userRepository.findOrCreate(fromUserID);
    const toUser = await this.userRepository.findOrCreate(toUserID);

    toUser.mamadas += qty;
    fromUser.mamou += qty;

    await toUser.save();
    await fromUser.save();

    return { toUser, fromUser };
  }
};
