import {
  Interaction,
  Collection,
  ThreadChannel,
  GuildChannel,
  TextChannel,
} from 'discord.js-light';
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

    if (interaction.user.id === '435228312214962204')
      console.log(interaction.channel as TextChannel, (interaction.channel as TextChannel).guild);

    InteractionCommandExecutor(this.client, interaction);
  }
}
