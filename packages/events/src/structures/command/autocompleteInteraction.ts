import { Interaction } from 'discordeno/transformers';
import { executeGivebadgeAutocomplete } from '../../modules/badges/givebadgeCommandAutocompleteInteraction.js';
import { executeCommandNameAutocomplete } from '../../modules/top/commandIdAutocompleteInteraction.js';
import { executeTituleAutocompleteInteraction } from '../../commands/util/PersonalizeCommand.js';
import { announceAutocomplete } from '../../modules/fazendinha/announceProduct.js';
import { listItemAutocomplete } from '../../modules/fazendinha/exploreFair.js';

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
    case 'fazendinha': {
      const subcommand = interaction.data?.options?.[0].options?.[0].name;

      if (subcommand === 'anunciar') {
        announceAutocomplete(interaction);
        break;
      }

      listItemAutocomplete(interaction);
      break;
    }
  }
};

export { autocompleteInteraction };
