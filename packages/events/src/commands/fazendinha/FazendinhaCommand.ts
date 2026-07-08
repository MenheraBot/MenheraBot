import { ApplicationCommandOptionTypes } from '@discordeno/bot';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { displayPlantations } from '../../modules/fazendinha/displayPlantations.js';
import { changeSelectedSeed, executeFieldAction } from '../../modules/fazendinha/fieldAction.js';
import { displaySilo, handleButtonAction } from '../../modules/fazendinha/displaySilo.js';
import { AvailablePlants } from '../../modules/fazendinha/types.js';
import {
  displayAdministrateFarm,
  handleAdministrativeComponents,
  handleManageFarm,
} from '../../modules/fazendinha/administrateFarm.js';
import {
  executeButtonPressed,
  executeDailyDelivery,
} from '../../modules/fazendinha/dailyDelivery.js';
import {
  executeAdministrateFair,
  handleDissmissShop,
} from '../../modules/fazendinha/administrateFair.js';
import { executeAnnounceProduct } from '../../modules/fazendinha/announceProduct.js';
import { executeButtonAction, executeExploreFair } from '../../modules/fazendinha/exploreFair.js';
import { User } from '../../types/discordeno.js';
import { displayFairOrders, handleFairOrderButton } from '../../modules/fazendinha/fairOrders.js';
import userRepository from '../../database/repositories/userRepository.js';
import {
  displayComposter,
  handleComposterInteractions,
} from '../../modules/fazendinha/farmComposter.js';
import { handleDiscardSeeds } from '../../modules/fazendinha/manageSilo.js';

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
      name: 'composteira',
      nameLocalizations: { 'en-US': 'composter' },
      description: '「🧺」・ Transforme matéria orgânica em fertilizantes para seus campos',
      descriptionLocalizations: {
        'en-US': '「🧺」・ Transform organic matter into fertilizer for your fields.',
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
          description: '「🎰」・Anuncie um produto na feira da vizinhança',
          descriptionLocalizations: {
            'en-US': '「🎰」・Advertise a product at the neighborhood fair',
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
              name: 'qualidade',
              nameLocalizations: { 'en-US': 'quality' },
              description: 'Qualidade da planta que está querendo vender',
              descriptionLocalizations: {
                'en-US': 'Plant quality that you want to sell',
              },
              type: ApplicationCommandOptionTypes.Integer,
              required: true,
              choices: [
                {
                  name: 'Planta Prêmium 🔹',
                  value: 2,
                  nameLocalizations: { 'en-US': 'Premium Plant 🔹' },
                },
                {
                  name: 'Planta',
                  value: 1,
                  nameLocalizations: { 'en-US': 'Plant' },
                },
                {
                  name: 'Planta Precária 🔻',
                  value: 0,
                  nameLocalizations: { 'en-US': 'Precarious Plant 🔻' },
                },
              ],
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
          name: 'trocas',
          nameLocalizations: { 'en-US': 'trades' },
          description: '「📥」・Troque produtos na sua vizinhança',
          descriptionLocalizations: { 'en-US': '「📥」・ Trade products on your neighborhood.' },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: 'vizinho',
              nameLocalizations: { 'en-US': 'neighbor' },
              description: 'Vizinho para ver os pedidos de trocas',
              descriptionLocalizations: {
                'en-US': 'Neighbor to check the trade requests',
              },
              type: ApplicationCommandOptionTypes.User,
              required: false,
            },
            {
              type: ApplicationCommandOptionTypes.Integer,
              name: 'página',
              nameLocalizations: { 'en-US': 'page' },
              description: 'Página dos pedidos que tu quer ver',
              descriptionLocalizations: { 'en-US': 'Trade requests page you want to see' },
              required: false,
              minValue: 1,
              maxValue: 100,
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
        {
          name: 'administrar',
          nameLocalizations: { 'en-US': 'manage' },
          description: '「🔧」・Administre os produtos anunciados na feira',
          descriptionLocalizations: {
            'en-US': '「🔧」・Manage the products announced at the fair',
          },
          type: ApplicationCommandOptionTypes.SubCommand,
        },
      ],
    },
    {
      name: 'administrar',
      nameLocalizations: { 'en-US': 'manage' },
      description: '「🔧」・Administre toda a sua fazenda',
      descriptionLocalizations: {
        'en-US': '「🔧」・Manage all of your farm',
      },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
  ],
  category: 'fazendinha',
  commandRelatedExecutions: [
    executeFieldAction,
    changeSelectedSeed,
    handleButtonAction,
    handleAdministrativeComponents,
    executeButtonPressed,
    handleManageFarm,
    handleDissmissShop,
    executeButtonAction,
    handleButtonAction,
    handleFairOrderButton,
    handleComposterInteractions,
    handleDiscardSeeds,
  ],
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const command = ctx.getSubCommand();

    const farmer = await farmerRepository.getFarmer(ctx.author.id);

    const lastPlantedSeedFromSilo = farmer.seeds.find((b) => b.plant === farmer.lastPlantedSeed);

    const group = ctx.getSubCommandGroup();

    if (group === 'feira') {
      if (command === 'anunciar') return executeAnnounceProduct(ctx, farmer);

      if (command === 'comprar') return executeExploreFair(ctx, farmer);

      if (command === 'administrar')
        return executeAdministrateFair(ctx, 'EDIT_POST', ctx.authorData);

      if (command === 'trocas') {
        const user = ctx.getOption<User>('vizinho', 'users', false);
        const page = ctx.getOption<number>('página', false) ?? 1;

        const isAuthorTarget = !user || ctx.user.id === user.id;

        const userData = isAuthorTarget
          ? ctx.authorData
          : await userRepository.ensureFindUser(user.id);

        const realFarmer = isAuthorTarget ? farmer : await farmerRepository.getFarmer(user.id);

        return displayFairOrders(ctx, realFarmer, userData.selectedColor, {
          user: isAuthorTarget ? undefined : user,
          page: isAuthorTarget ? page - 1 : undefined,
        });
      }
    }

    if (command === 'composteira')
      return displayComposter(ctx, farmer, ctx.authorData.selectedColor);

    if (command === 'administrar') return displayAdministrateFarm(ctx, false);

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
