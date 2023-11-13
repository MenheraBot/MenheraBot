import { ApplicationCommandOptionTypes } from 'discordeno/types';
import farmerRepository from '../../database/repositories/farmerRepository';
import { createCommand } from '../../structures/command/createCommand';
import { displayPlantations } from '../../modules/fazendinha/displayPlantations';
import { changeSelectedSeed, executeFieldAction } from '../../modules/fazendinha/fieldAction';
import { displaySilo, handleButtonAction } from '../../modules/fazendinha/displaySilo';
import { AvailablePlants } from '../../modules/fazendinha/types';
import {
  executeAdministrateFields,
  handleAdministrativeComponents,
} from '../../modules/fazendinha/administrateFields';
import { executeButtonPressed, executeDailyDelivery } from '../../modules/fazendinha/dailyDelivery';
import {
  executeAdministrateSilo,
  handleUpgradeSilo,
} from '../../modules/fazendinha/administrateSilo';
import { executeAdministrateFair } from '../../modules/fazendinha/administrateFair';

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
      name: 'entregas',
      description: '「🚚」・ Veja e gerencie as tuas entregas diárias',
      nameLocalizations: { 'en-US': 'deliveries' },
      descriptionLocalizations: { 'en-US': '「🚚」・ View and manage your daily deliveries' },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'administrar',
      nameLocalizations: { 'en-US': 'manage' },
      description: '「⚙️」・Administre toda a sua fazenda',
      descriptionLocalizations: {
        'en-US': '「⚙️」・Manage all of your farm',
      },
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      options: [
        {
          name: 'campos',
          nameLocalizations: { 'en-US': 'fields' },
          description: '「🟫」・Administre os campos de sua fazenda',
          descriptionLocalizations: { 'en-US': '「🟫」・Manage your farm fields' },
          type: ApplicationCommandOptionTypes.SubCommand,
        },
        {
          name: 'silo',
          description: '「🧺」・Administre o limite do seu silo',
          descriptionLocalizations: { 'en-US': '「🧺」・Manage the limits from your silo' },
          type: ApplicationCommandOptionTypes.SubCommand,
        },
        {
          name: 'feira',
          nameLocalizations: { 'en-US': 'fair' },
          description: '「🛒」・Administre a sua feirinha da vizinhança',
          descriptionLocalizations: { 'en-US': '「🛒」・Manage your neighborhood fair' },
          type: ApplicationCommandOptionTypes.SubCommand,
        },
      ],
    },
  ],
  category: 'economy',
  commandRelatedExecutions: [
    executeFieldAction,
    changeSelectedSeed,
    handleButtonAction,
    handleAdministrativeComponents,
    executeButtonPressed,
    handleUpgradeSilo,
  ],
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const command = ctx.getSubCommand();

    const farmer = await farmerRepository.getFarmer(ctx.author.id);

    const lastPlantedSeedFromSilo = farmer.seeds.find(
      (b) => b.plant === farmer.lastPlantedSeed ?? AvailablePlants.Mate,
    );

    const group = ctx.getSubCommandGroup();

    if (group === 'administrar') {
      if (command === 'campos') return executeAdministrateFields(ctx, farmer);

      if (command === 'silo') return executeAdministrateSilo(ctx, farmer);

      if (command === 'feira') return executeAdministrateFair(ctx);
    }

    if (command === 'entregas')
      return executeDailyDelivery(ctx, farmer, ctx.authorData.selectedColor);

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
