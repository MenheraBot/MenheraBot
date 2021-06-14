module.exports = class GuildsRepository {
  constructor(guildModal) {
    this.guildModal = guildModal;
  }

  async find(guildID) {
    return this.guildModal.findOne({ id: guildID });
  }

  create(guildID, lang) {
    this.guildModal.create({ id: guildID, lang });
  }

  delete(guildID) {
    this.guildModal.deleteOne({ id: guildID });
  }
};
