import {
  Interaction,
  Collection,
  ThreadChannel,
  GuildChannel,
  TextChannel,
} from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import InteractionCommandExecutor from '@structures/command/InteractionCommandExecutor';
import { debugError } from '@utils/Util';

export default class InteractionCreate {
  async run(
    interaction: Interaction & { client: MenheraClient; channel: TextChannel },
  ): Promise<void> {
    if (!interaction.isCommand() || !interaction.inGuild()) return;

    if (!interaction.channel?.isText()) return;

    if (interaction.client.shuttingDown) {
      interaction.reply({
        content:
          'A Menhera está em processo de desligamento! Comandos estão desativados!\n\nMenhera is in the process of shutting down! Commands are disabled!',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.client.channels.cache.has(interaction.channelId)) {
      const channel = await interaction.client.channels
        .fetch(interaction.channelId)
        .catch(debugError);

      if (!channel) {
        interaction.reply({
          content:
            "> ❌ Eu não tenho a permissão `Ver Canais` para executar esse comando! Peça a um administrador para me dar esta permissão!\n> ❌ I don't have `View Channels` permission to run this command! Ask an administrator to give me this permission!",
          ephemeral: true,
        });
        return;
      }

      (
        interaction.client.channels.cache as Collection<string, ThreadChannel | GuildChannel>
      ).forceSet(interaction.channelId, channel);

      (
        interaction.guild?.channels.cache as Collection<string, ThreadChannel | GuildChannel>
      ).forceSet(interaction.channelId, channel);
    }

    // @ts-expect-error Interaction is not as type expected, BUT IT IS
    InteractionCommandExecutor(interaction.client, interaction);
  }
}
