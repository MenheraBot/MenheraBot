import { Guild } from 'discord.js';
import MenheraClient from 'MenheraClient';

export default class GuildCreate {
  private region: { [key: string]: string };

  constructor(public client: MenheraClient) {
    this.client = client;
    this.region = {
      brazil: 'pt-BR',
      europe: 'en-US',
      'eu-central': 'en-US',
      'eu-west': 'en-US',
      hongkong: 'en-US',
      japan: 'en-US',
      russia: 'en-US',
      singapore: 'en-US',
      southafrica: 'en-US',
      sydney: 'en-US',
      'us-central': 'en-US',
      'us-east': 'en-US',
      'us-south': 'en-US',
      'us-west': 'en-US',
    };
  }

  async run(guild: Guild) {
    this.client.repositories.guildRepository.create(guild.id, this.region[guild.region]);

    if (!process.env.GUILDS_HOOK_ID) {
      throw new Error('GUILDS_HOOK_ID is not defined');
    }

    const webhook = await this.client.fetchWebhook(
      process.env.GUILDS_HOOK_ID,
      process.env.GUILDS_HOOK_TOKEN,
    );
    webhook.send(`<:MenheraWink:767210250637279252> | Fui adicionada do servidor **${guild}**`);
  }
}
