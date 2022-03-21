import { Interaction } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import InteractionCommandExecutor from '@structures/command/InteractionCommandExecutor';
import ExecuteAutocompleteInteractions from '@structures/command/InteractionCommandAutocomplete';

export default class InteractionCreate {
  async run(interaction: Interaction & { client: MenheraClient }): Promise<void> {
    if (!interaction.inGuild()) return;

    if (!interaction.channel?.isText()) return;

    if (interaction.isAutocomplete()) {
      ExecuteAutocompleteInteractions(interaction);
      return;
    }

    if (!interaction.isCommand()) return;

    if (interaction.client.shuttingDown) {
      interaction.reply({
        content:
          'A Menhera está em processo de desligamento! Comandos estão desativados!\n\nMenhera is in the process of shutting down! Commands are disabled!',
        ephemeral: true,
      });
      return;
    }

    // @ts-expect-error Interaction is not as type expected, BUT IT IS
    InteractionCommandExecutor(interaction);
  }
}
