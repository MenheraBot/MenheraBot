import { Guild } from 'discord.js-light';
import MenheraClient from 'MenheraClient';

export default class GuildDelete {
  async run(guild: Guild & { client: MenheraClient }): Promise<void> {
    if (!guild || !guild.id) return;

    await guild.client.repositories.guildRepository.delete(guild.id);
  }
}
