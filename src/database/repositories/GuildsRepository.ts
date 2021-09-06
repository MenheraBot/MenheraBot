import { Guilds } from '@structures/DatabaseCollections';
import { IGuildSchema } from '@utils/Types';
import { UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';

export default class GuildsRepository {
  constructor(private guildModal: typeof Guilds) {}

  async find(guildID: string): Promise<IGuildSchema | null> {
    return this.guildModal.findOne({ id: guildID });
  }

  async update(
    guildID: string,
    query: UpdateQuery<IGuildSchema> | UpdateWithAggregationPipeline,
  ): Promise<void> {
    await this.guildModal.updateOne({ id: guildID }, query);
  }

  async findOrCreate(guildID: string): Promise<IGuildSchema> {
    const guild = await this.find(guildID);
    if (guild) return guild;
    return this.create(guildID, 'pt-BR');
  }

  async create(guildID: string, lang: string): Promise<IGuildSchema> {
    return this.guildModal.create({ id: guildID, lang });
  }

  async delete(guildID: string): Promise<void> {
    await this.guildModal.deleteOne({ id: guildID });
  }

  async updateLang(guildID: string, lang: string): Promise<void> {
    await this.update(guildID, { lang });
  }
}
