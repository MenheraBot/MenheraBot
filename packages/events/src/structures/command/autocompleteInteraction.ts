import { Interaction } from 'discordeno/transformers';
import { executeGivebadgeAutocomplete } from '../../modules/badges/givebadgeCommandAutocompleteInteraction';
import { executeCommandNameAutocomplete } from '../../modules/top/commandIdAutocompleteInteraction';
import { executeTituleAutocompleteInteraction } from '../../commands/util/PersonalizeCommand';
import { announceAutocomplete } from '../../modules/fazendinha/announceProduct';

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
    case 'fazendinha':
      announceAutocomplete(interaction);
  }
};

export { autocompleteInteraction };
