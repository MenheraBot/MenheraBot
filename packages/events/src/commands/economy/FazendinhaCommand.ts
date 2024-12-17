import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';
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
import {
  executeAdministrateFair,
  handleDissmissShop,
} from '../../modules/fazendinha/administrateFair';
import { executeAnnounceProduct } from '../../modules/fazendinha/announceProduct';
import { executeButtonAction, executeExploreFair } from '../../modules/fazendinha/exploreFair';

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
      description: '「🧺」・Dê uma olhada no silo da fazenda de alguém',
      descriptionLocalizations: {
        'en-US': "「🧺」・Take a look inside someone's farm silo",
      },
      options: [
        {
          name: 'fazendeiro',
          nameLocalizations: { 'en-US': 'farmer' },
          description: 'Fazendeiro que você quer ver o silo',
          descriptionLocalizations: { 'en-US': 'Farmer do you want to see the silo' },
          type: ApplicationCommandOptionTypes.User,
          required: false,
        },
      ],
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
      name: 'feira',
      nameLocalizations: { 'en-US': 'fair' },
      description: '「🛒」・Acesse a feira da vizinhança',
      descriptionLocalizations: { 'en-US': '「🛒」・Access the neighborhood fair' },
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      options: [
        {
          type: ApplicationCommandOptionTypes.SubCommand,
          name: 'anunciar',
          nameLocalizations: { 'en-US': 'advertise' },
          description: '「🏷️」・Anuncie um produto na feira da vizinhança',
          descriptionLocalizations: {
            'en-US': '「🏷️」・Advertise a product at the neighborhood fair',
          },
          options: [
            {
              name: 'produto',
              nameLocalizations: { 'en-US': 'product' },
              description: 'Escolha qual produto você quer vender',
              descriptionLocalizations: { 'en-US': 'Select which product do you wanna sell' },
              type: ApplicationCommandOptionTypes.Integer,
              autocomplete: true,
              required: true,
            },
            {
              name: 'quantidade',
              nameLocalizations: { 'en-US': 'amount' },
              description: 'Informe a quantidade de produtos a vender',
              descriptionLocalizations: { 'en-US': 'Enter the quantity of products to sell' },
              type: ApplicationCommandOptionTypes.Number,
              minValue: 1,
              maxValue: 10,
              required: true,
            },
            {
              name: 'preço',
              nameLocalizations: { 'en-US': 'price' },
              description: 'Por quantas estrelinhas tu vai anunciar esse produto?',
              descriptionLocalizations: {
                'en-US': 'How many stars are you going to advertise this product for?',
              },
              type: ApplicationCommandOptionTypes.Integer,
              autocomplete: true,
              required: true,
            },
          ],
        },
        {
          name: 'comprar',
          nameLocalizations: { 'en-US': 'buy' },
          description: '「🛒」・Compre itens da feira da vizinhança',
          descriptionLocalizations: { 'en-US': '「🛒」・Buy items from the neighborhood fair' },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: 'item',
              nameLocalizations: { 'en-US': 'item' },
              description: 'Item que você quer comprar',
              descriptionLocalizations: { 'en-US': 'Item that you want to buy' },
              type: ApplicationCommandOptionTypes.String,
              autocomplete: true,
              required: false,
            },
            {
              name: 'vizinho',
              nameLocalizations: { 'en-US': 'neighbor' },
              description: 'Vizinho específico que você quer ver os itens a venda',
              descriptionLocalizations: {
                'en-US': 'Specific neighbor you want to see items for sale',
              },
              type: ApplicationCommandOptionTypes.User,
              required: false,
            },
          ],
        },
      ],
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
    handleDissmissShop,
    executeButtonAction,
    handleButtonAction,
  ],
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const command = ctx.getSubCommand();

    const farmer = await farmerRepository.getFarmer(ctx.author.id);

    const lastPlantedSeedFromSilo = farmer.seeds.find((b) => b.plant === farmer.lastPlantedSeed);

    const group = ctx.getSubCommandGroup();

    if (group === 'administrar') {
      if (command === 'campos') return executeAdministrateFields(ctx, farmer);

      if (command === 'silo') return executeAdministrateSilo(ctx, farmer);

      if (command === 'feira') return executeAdministrateFair(ctx, ctx.authorData);
    }

    if (group === 'feira') {
      if (command === 'anunciar') return executeAnnounceProduct(ctx, farmer);

      if (command === 'comprar') return executeExploreFair(ctx, farmer);
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

    if (command === 'silo') {
      const userOption = ctx.getOption<User>('fazendeiro', 'users', false);

      if (userOption && userOption.id !== ctx.user.id) {
        const selectedFarmer = await farmerRepository.getFarmer(userOption.id);
        return displaySilo(ctx, selectedFarmer, ctx.authorData.selectedColor);
      }

      return displaySilo(ctx, farmer, ctx.authorData.selectedColor);
    }
  },
});

export default FazendinhaCommand;
