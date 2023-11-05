import { ApplicationCommandOptionTypes } from 'discordeno/types';
import farmerRepository from '../../database/repositories/farmerRepository';
import { createCommand } from '../../structures/command/createCommand';
import { displayPlantations } from '../../modules/fazendinha/displayPlantations';
import { changeSelectedSeed, executeFieldAction } from '../../modules/fazendinha/fieldAction';
import { displaySilo, handleButtonAction } from '../../modules/fazendinha/displaySilo';
import { AvailablePlants } from '../../modules/fazendinha/types';

const FazendinhaCommand = createCommand({
  path: '',
  name: 'fazendinha',
  nameLocalizations: {
    'en-US': 'farm',
  },
  description: '「🚜」・Visite a sua fazendinha no interior',
  descriptionLocalizations: {
    'en-US': '「🚜」・Visit your farm in the countryside',
  },
  options: [
    {
      name: 'plantações',
      nameLocalizations: {
        'en-US': 'plantations',
      },
      description: '「🥬」・Cuide das plantações de sua fazendinha',
      descriptionLocalizations: {
        'en-US': '「🥬」・Take care of your farm fields',
      },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'silo',
      description: '「🧺」・Dê uma olhada no silo de sua fazenda',
      descriptionLocalizations: {
        'en-US': "「🧺」・Take a look on your farm's silo",
      },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'administrar',
      nameLocalizations: { 'en-US': 'manage' },
      description: '「⚙️」・Administre toda a sua fazenda',
      descriptionLocalizations: {
        'en-US': '「⚙️」・Manage all of your farm',
      },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
  ],
  category: 'economy',
  commandRelatedExecutions: [executeFieldAction, changeSelectedSeed, handleButtonAction],
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const command = ctx.getSubCommand();

    const farmer = await farmerRepository.getFarmer(ctx.author.id);

    const lastPlantedSeedFromSilo = farmer.seeds.find(
      (b) => b.plant === farmer.lastPlantedSeed ?? AvailablePlants.Mate,
    );

    if (command === 'plantações')
      return displayPlantations(
        ctx,
        farmer,
        ctx.authorData.selectedColor,
        typeof lastPlantedSeedFromSilo === 'undefined' || lastPlantedSeedFromSilo.amount <= 0
          ? AvailablePlants.Mate
          : lastPlantedSeedFromSilo.plant,
        -1,
      );

    if (command === 'silo') return displaySilo(ctx, farmer, ctx.authorData.selectedColor);
  },
});

export default FazendinhaCommand;
