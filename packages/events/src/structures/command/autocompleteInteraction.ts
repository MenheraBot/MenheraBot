import { Interaction } from 'discordeno/transformers';
import { executeGivebadgeAutocomplete } from '../../modules/badges/givebadgeCommandAutocompleteInteraction';
import { executeCommandNameAutocomplete } from '../../modules/top/commandIdAutocompleteInteraction';

const autocompleteInteraction = (interaction: Interaction): void => {
  const commandName = interaction.data?.name;

  switch (commandName) {
    case 'givebadge':
      executeGivebadgeAutocomplete(interaction);
      break;
    case 'top':
      executeCommandNameAutocomplete(interaction);
      break;
  }
};

export { autocompleteInteraction };
