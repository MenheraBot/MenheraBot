import { Interaction } from 'discordeno/transformers';
import { executeGivebadgeAutocomplete } from '../../modules/badges/givebadgeCommandAutocompleteInteraction';
import { executeCommandIdAutocomplete } from '../../modules/top/commandIdAutocompleteInteraction';

const autocompleteInteraction = (interaction: Interaction): void => {
  const commandName = interaction.data?.name;

  switch (commandName) {
    case 'givebadge':
      executeGivebadgeAutocomplete(interaction);
      break;
    case 'top':
      executeCommandIdAutocomplete(interaction);
      break;
  }
};

export { autocompleteInteraction };
