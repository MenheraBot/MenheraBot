import { Guilds } from '@structures/DatabaseCollections';

export default class GuildsRepository {
  constructor(private guildModal: typeof Guilds) {
    this.guildModal = guildModal;
  }

  async find(guildID: string) {
    return this.guildModal.findOne({ id: guildID });
  }

  async findOrCreate(guildID: string) {
    const guild = await this.find(guildID);
    if (guild) return guild;
    return this.create(guildID, 'pt-BR');
  }

  async create(guildID: string, lang: string) {
    return this.guildModal.create({ id: guildID, lang });
  }

  async delete(guildID: string) {
    await this.guildModal.deleteOne({ id: guildID });
  }

  async updateLang(guildID: string, lang: string) {
    await this.guildModal.updateOne({ id: guildID }, { lang });
  }
}
