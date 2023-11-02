import { Interaction } from 'discordeno/transformers';
import { executeGivebadgeAutocomplete } from '../../modules/badges/givebadgeCommandAutocompleteInteraction';
import { executeCommandNameAutocomplete } from '../../modules/top/commandIdAutocompleteInteraction';
import { executeTituleAutocompleteInteraction } from '../../commands/util/PersonalizeCommand';

const autocompleteInteraction = (interaction: Interaction): void => {
  const commandName = interaction.data?.name;

  switch (commandName) {
    case 'give':
      executeGivebadgeAutocomplete(interaction);
      break;
    case 'personalizar':
      executeTituleAutocompleteInteraction(interaction);
      break;
    case 'top':
      executeCommandNameAutocomplete(interaction);
      break;
  }
};

export { autocompleteInteraction };
