import { Interaction, Collection, ThreadChannel, GuildChannel } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import InteractionCommandExecutor from '@structures/command/InteractionCommandExecutor';
import { clientUnreadyString } from '@structures/MenheraConstants';

export default class InteractionCreate {
  constructor(private client: MenheraClient) {}

  async run(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand() || !interaction.inGuild()) return;
    if (!this.client.isReady())
      return interaction
        .reply({ content: clientUnreadyString, ephemeral: true })
        .catch(() => undefined);

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

    console.log(this.client.shard?.ids[0], interaction);

    InteractionCommandExecutor(this.client, interaction);
  }
}
