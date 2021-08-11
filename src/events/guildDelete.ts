import { Guild } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Event from '@structures/Event';

export default class GuildDelete extends Event {
  constructor(public client: MenheraClient) {
    super(client);
  }

  async run(guild: Guild): Promise<void> {
    if (!guild || !guild.id || !guild.name) return;

    await this.client.repositories.guildRepository.delete(guild.id);

    if (!process.env.GUILDS_HOOK_ID) {
      throw new Error('GUILDS_HOOK_ID is not defined');
    }

    const webhook = await this.client.fetchWebhook(
      process.env.GUILDS_HOOK_ID,
      process.env.GUILDS_HOOK_TOKEN,
    );

    await webhook.send(
      `<:menhera_cry:744041825140211732> | Fui removida do servidor **${guild.name}**`,
    );
  }
}
