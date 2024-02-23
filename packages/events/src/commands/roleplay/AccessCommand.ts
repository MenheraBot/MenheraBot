import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { createCommand } from '../../structures/command/createCommand';
import {
  enterChurch,
  executeDisplayChurch,
} from '../../modules/roleplay/establishments/church/accessChurch';
import {
  executeNavigation,
  handleInteraction,
} from '../../modules/roleplay/establishments/blacksmith/accessBlacksmith';

const ChurchCommand = createCommand({
  path: '',
  name: 'acessar',
  nameLocalizations: { 'en-US': 'access' },
  description: '「RPG」・Recupere sua vitalidade e fortaleça sua fé',
  descriptionLocalizations: {
    'en-US': '「RPG」・Recover your vitality and strengthen your faith',
  },
  options: [
    {
      type: ApplicationCommandOptionTypes.SubCommand,
      name: 'ferreiro',
      description: '「RPG」・Acessa o ferreiro de sua localização atual',
      nameLocalizations: {
        'en-US': 'blacksmith',
      },
      descriptionLocalizations: {
        'en-US': '「RPG」・Access the blacksmith from your current location',
      },
    },
    {
      type: ApplicationCommandOptionTypes.SubCommand,
      name: 'igreja',
      nameLocalizations: { 'en-US': 'church' },
      description: '「RPG」・Recupere sua vitalidade e fortaleça sua fé',
      descriptionLocalizations: {
        'en-US': '「RPG」・Recover your vitality and strengthen your faith',
      },
    },
  ],
  category: 'roleplay',
  commandRelatedExecutions: [handleInteraction, enterChurch],
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const subCommand = ctx.getSubCommand();

    if (subCommand === 'ferreiro')
      return executeNavigation(ctx, 'sell', ctx.authorData.selectedColor);

    if (subCommand === 'igreja') return executeDisplayChurch(ctx);
  },
});

export default ChurchCommand;
