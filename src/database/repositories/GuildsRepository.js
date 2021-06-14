module.exports = class GuildsRepository {
  constructor(guildModal) {
    this.guildModal = guildModal;
  }

  create(guildID, lang) {
    this.guildModal.create({ id: guildID, lang });
  }

  delete(guildID) {
    this.guildModal.deleteOne({ id: guildID });
  }
};
