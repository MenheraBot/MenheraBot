import { AutocompleteInteraction } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import LibraryAutocomplete from './autocomplete/LibraryAutocomplete';

const ExecuteAutocompleteInteractions = async (
  interaction: AutocompleteInteraction & { client: MenheraClient },
): Promise<void> => {
  const { commandName } = interaction;

  switch (commandName) {
    case 'centro':
      return LibraryAutocomplete(interaction);
  }
};

export default ExecuteAutocompleteInteractions;
