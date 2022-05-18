import { AutocompleteInteraction } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import GiveBadgeAutocomplete from './autocomplete/GiveBadgesAutocomplete';
import LibraryAutocomplete from './autocomplete/LibraryAutocomplete';

const ExecuteAutocompleteInteractions = async (
  interaction: AutocompleteInteraction & { client: MenheraClient },
): Promise<void> => {
  const { commandName } = interaction;

  switch (commandName) {
    case 'centro':
      return LibraryAutocomplete(interaction);
    case 'givebadge':
      return GiveBadgeAutocomplete(interaction);
  }
};

export default ExecuteAutocompleteInteractions;
