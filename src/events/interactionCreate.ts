/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Interaction } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import InteractionCommandExecutor from '@structures/command/InteractionCommandExecutor';

export default class InteractionCreate {
  constructor(private client: MenheraClient) {}

  async run(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand() || !interaction.inGuild()) return;

    if (!this.client.channels.cache.has(interaction.channelId)) {
      const channel = await this.client.channels.fetch(interaction.channelId);
      // @ts-ignore
      this.client.channels.cache.forceSet(interaction.channelId, channel);
      // @ts-ignore
      interaction.guild?.channels.cache.forceSet(interaction.channelId, channel);
    }

    InteractionCommandExecutor(this.client, interaction);
  }
}
