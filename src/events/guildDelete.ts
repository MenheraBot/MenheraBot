import { Guild } from 'discord.js';
import MenheraClient from 'MenheraClient';

export default class GuildDelete {
  constructor(public client: MenheraClient) {
    this.client = client;
  }

  async run(guild: Guild) {
    if (!guild || !guild.id || !guild.name) return;

    this.client.repositories.guildRepository.delete(guild.id);

    if (!process.env.GUILDS_HOOK_ID) {
      throw new Error('GUILDS_HOOK_ID is not defined');
    }

    const webhook = await this.client.fetchWebhook(
      process.env.GUILDS_HOOK_ID,
      process.env.GUILDS_HOOK_TOKEN,
    );

    webhook.send(`<:menhera_cry:744041825140211732> | Fui removida do servidor **${guild.name}**`);
  }
}
