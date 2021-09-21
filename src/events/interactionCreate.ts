import { Interaction, Collection, ThreadChannel, GuildChannel } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import InteractionCommandExecutor from '@structures/command/InteractionCommandExecutor';

export default class InteractionCreate {
  constructor(private client: MenheraClient) {}

  async run(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand() || !interaction.inGuild()) return;

    if (!this.client.channels.cache.has(interaction.channelId)) {
      const channel = await this.client.channels.fetch(interaction.channelId).catch(() => null);
      if (channel) {
        (this.client.channels.cache as Collection<string, ThreadChannel | GuildChannel>).forceSet(
          interaction.channelId,
          channel,
        );
        (
          interaction.guild?.channels.cache as Collection<string, ThreadChannel | GuildChannel>
        ).forceSet(interaction.channelId, channel);
      }
    }

    InteractionCommandExecutor(this.client, interaction);
  }
}
