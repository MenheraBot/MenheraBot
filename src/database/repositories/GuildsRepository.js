module.exports = class GuildsRepository {
  constructor(guildModal) {
    this.guildModal = guildModal;
  }

  async find(guildID) {
    return this.guildModal.findOne({ id: guildID });
  }

  async create(guildID, lang) {
    return this.guildModal.create({ id: guildID, lang });
  }

  async delete(guildID) {
    return this.guildModal.deleteOne({ id: guildID });
  }
};
