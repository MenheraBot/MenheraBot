import { ApplicationCommandOptionTypes } from 'discordeno/types';
import farmerRepository from '../../database/repositories/farmerRepository';
import { createCommand } from '../../structures/command/createCommand';
import { displayPlantations } from '../../modules/fazendinha/displayPlantations';

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
  ],
  category: 'fun',
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const farmer = await farmerRepository.getFarmer(ctx.author.id);

    displayPlantations(ctx, farmer);
  },
});

export default FazendinhaCommand;
