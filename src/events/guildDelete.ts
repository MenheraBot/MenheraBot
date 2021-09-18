import { Guild } from 'discord.js-light';
import MenheraClient from 'src/MenheraClient';

export default class GuildDelete {
  constructor(private client: MenheraClient) {}

  async run(guild: Guild): Promise<void> {
    if (!guild || !guild.id) return;

    await this.client.repositories.guildRepository.delete(guild.id);
  }
}
