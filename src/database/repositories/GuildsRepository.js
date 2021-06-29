module.exports = class GuildsRepository {
  constructor(guildModal) {
    this.guildModal = guildModal;
  }

  async find(guildID) {
    return this.guildModal.findOne({ id: guildID });
  }

  async findOrCreate(guildID) {
    const guild = await this.find(guildID);
    if (guild) return guild;
    return this.create(guildID, 'pt-BR');
  }

  async create(guildID, lang) {
    return this.guildModal.create({ id: guildID, lang });
  }

  async delete(guildID) {
    await this.guildModal.deleteOne({ id: guildID });
  }

  async updateLang(guildID, lang) {
    await this.guildModal.updateOne({ id: guildID }, { lang });
  }
};
