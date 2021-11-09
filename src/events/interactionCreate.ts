import {
  Interaction,
  Collection,
  ThreadChannel,
  GuildChannel,
  TextChannel,
} from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import InteractionCommandExecutor from '@structures/command/InteractionCommandExecutor';
import { clientUnreadyString } from '@structures/Constants';
import { debugError } from '@utils/Util';

export default class InteractionCreate {
  async run(
    interaction: Interaction & { client: MenheraClient; channel: TextChannel },
  ): Promise<void> {
    if (!interaction.isCommand() || !interaction.inGuild()) return;
    if (!interaction.client.isReady())
      return interaction
        .reply({ content: clientUnreadyString, ephemeral: true })
        .catch(() => undefined);

    if (!interaction.channel?.isText()) return;

    if (!interaction.client.channels.cache.has(interaction.channelId)) {
      const channel = await interaction.client.channels
        .fetch(interaction.channelId)
        .catch(debugError);
      if (channel) {
        (
          interaction.client.channels.cache as Collection<string, ThreadChannel | GuildChannel>
        ).forceSet(interaction.channelId, channel);
        (
          interaction.guild?.channels.cache as Collection<string, ThreadChannel | GuildChannel>
        ).forceSet(interaction.channelId, channel);
      }
    }

    InteractionCommandExecutor(interaction.client, interaction);
  }
}
