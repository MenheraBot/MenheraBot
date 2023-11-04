import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';

import { buyColor, executeBuyColorSelectComponent } from '../../modules/shop/buyColor';
import { buyImages, executeBuyImagesSelectComponent } from '../../modules/shop/buyImages';
import { buyInfo } from '../../modules/shop/buyInfo';
import { buyItems, executeSelectItem } from '../../modules/shop/buyItems';
import { buyRolls } from '../../modules/shop/buyRolls';
import { buyThemes, executeActivateTheme, executeClickButton } from '../../modules/shop/buyThemes';
import { sellHunts } from '../../modules/shop/sellHunts';
import { sellInfo } from '../../modules/shop/sellInfo';
import { transactionableCommandOption } from '../../structures/constants';
import { buySeeds, handleBuySeedsInteractions } from '../../modules/shop/buySeeds';
import { buildSellPlantsMessage } from '../../modules/fazendinha/displaySilo';
import farmerRepository from '../../database/repositories/farmerRepository';

const ShopCommand = createCommand({
  path: '',
  name: 'loja',
  nameLocalizations: { 'en-US': 'shop' },
  description: '「💴」・Abre o brechó da Menhera',
  descriptionLocalizations: { 'en-US': "Open Menhera's thrift store" },
  options: [
    {
      name: 'comprar',
      nameLocalizations: { 'en-US': 'buy' },
      description: '「🛒」・Abre a loja de compras',
      descriptionLocalizations: { 'en-US': '「🛒」・Opens the shopping store' },
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      options: [
        {
          name: 'itens',
          nameLocalizations: { 'en-US': 'items' },
          description: '「🔮」・ Compre itens mágicos para melhorar suas habilidades',
          descriptionLocalizations: {
            'en-US': '「🔮」・Buy magic items to improve your skills',
          },
          type: ApplicationCommandOptionTypes.SubCommand,
        },
        {
          name: 'sementes',
          nameLocalizations: { 'en-US': 'seeds' },
          description: '「🌱」・ Compre sementes para plantar em sua fazendinha',
          descriptionLocalizations: {
            'en-US': '「🌱」・Buy seeds to plant in your farm',
          },
          type: ApplicationCommandOptionTypes.SubCommand,
        },
        {
          name: 'cores',
          nameLocalizations: { 'en-US': 'colors' },
          description: '「🌈」・Compre cores para dar um UP em seu perfil!',
          descriptionLocalizations: { 'en-US': '「🌈」・Buy colors to upgrade your profile!' },
          type: ApplicationCommandOptionTypes.SubCommand,
        },
        {
          name: 'imagens',
          nameLocalizations: { 'en-US': 'images' },
          description: '「🏞️」・Compre imagens para deixar o seu perfil a sua cara',
          descriptionLocalizations: {
            'en-US': '「🏞️」・Buy images to make your profile yout face!',
          },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: 'sua_imagem',
              nameLocalizations: { 'en-US': 'your_image' },
              description: 'Envie sua própria imagem para usá-la em seu perfil',
              descriptionLocalizations: {
                'en-US': 'Upload your own image to use it in your profile',
              },
              type: ApplicationCommandOptionTypes.Attachment,
              required: false,
            },
          ],
        },
        {
          name: 'rolls',
          description: '「🎟️」・Compre rolls para resetar seu tempo de caça',
          descriptionLocalizations: { 'en-US': '「🎟️」・Buy rolls to reset your hunting time' },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: 'quantidade',
              nameLocalizations: { 'en-US': 'amount' },
              description: 'Quantidade de rolls que você quer comprar',
              descriptionLocalizations: { 'en-US': 'Number of rolls you want to buy' },
              type: ApplicationCommandOptionTypes.Integer,
              required: true,
              minValue: 1,
            },
          ],
        },
        {
          name: 'temas',
          nameLocalizations: { 'en-US': 'themes' },
          description: '「🎊」・Compre temas para a sua conta',
          descriptionLocalizations: { 'en-US': '「🎊」・Buy themes for your account' },
          type: ApplicationCommandOptionTypes.SubCommand,
        },
      ],
    },
    {
      name: 'vender',
      nameLocalizations: { 'en-US': 'sell' },
      description: 'Venda suas caças',
      descriptionLocalizations: { 'en-US': '「💸」・ Sell your fighters' },
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      options: [
        {
          name: 'caças',
          nameLocalizations: { 'en-US': 'hunts' },
          description: '「🐾」・ Venda as suas caças',
          descriptionLocalizations: { 'en-US': '「🐾」・ Sell your hunts' },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: 'tipo',
              nameLocalizations: { 'en-US': 'type' },
              description: 'Tipo de caça para vender',
              descriptionLocalizations: { 'en-US': 'Type of hunting to sell' },
              type: ApplicationCommandOptionTypes.String,
              required: true,
              choices: transactionableCommandOption.filter((a) => a.value !== 'estrelinhas'),
            },
            {
              name: 'quantidade',
              nameLocalizations: { 'en-US': 'amount' },
              description: 'Quantidade de caças para vender',
              descriptionLocalizations: { 'en-US': 'Number of huntings to sell' },
              type: ApplicationCommandOptionTypes.Integer,
              required: true,
              minValue: 1,
            },
          ],
        },
        {
          name: 'plantas',
          nameLocalizations: { 'en-US': 'plants' },
          description: '「🌿」・Venda as suas plantas',
          descriptionLocalizations: { 'en-US': '「🌿」・Sell your plants' },
          type: ApplicationCommandOptionTypes.SubCommand,
        },
      ],
    },
    {
      name: 'preços',
      nameLocalizations: { 'en-US': 'prices' },
      description: '「📊」・Mostra a tabela de preços da Menhera',
      descriptionLocalizations: { 'en-US': "「📊」・Show Menhera's price list" },
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      options: [
        {
          name: 'comprar',
          nameLocalizations: { 'en-US': 'buy' },
          description: '「📈」・ Mostra os preços de itens de compras',
          descriptionLocalizations: { 'en-US': '「📈」・ Shows the prices of shopping items' },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: 'tipo',
              nameLocalizations: { 'en-US': 'type' },
              description: 'Tipo da compra para precificar',
              descriptionLocalizations: { 'en-US': 'Purchase type for pricing' },
              type: ApplicationCommandOptionTypes.String,
              required: true,
              choices: [
                {
                  name: '🌈 | Cores',
                  nameLocalizations: { 'en-US': '🌈 | Colors' },
                  value: 'colors',
                },
                {
                  name: '🔑 | Rolls',
                  value: 'rolls',
                },
                {
                  name: '🔮 | Itens Mágicos',
                  nameLocalizations: { 'en-US': '🔮 | Magic Items' },
                  value: 'items',
                },
                {
                  name: '🌿 | Sementes',
                  nameLocalizations: { 'en-US': '🌿 | Seeds' },
                  value: 'seeds',
                },
              ],
            },
          ],
        },
        {
          name: 'vender',
          nameLocalizations: { 'en-US': 'sell' },
          description: '「📈」・ Mostra os preços de itens de venda',
          descriptionLocalizations: { 'en-US': '「📈」・ Shows the prices of sale items' },
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: 'tipo',
              nameLocalizations: { 'en-US': 'type' },
              description: 'Tipo de vendas para precificar',
              descriptionLocalizations: { 'en-US': 'Sales type to price' },
              type: ApplicationCommandOptionTypes.String,
              required: true,
              choices: [
                {
                  name: '🐾 | Caças',
                  nameLocalizations: { 'en-US': '🐾 | Hunts' },
                  value: 'hunts',
                },
                {
                  name: '🌿 | Plantas',
                  nameLocalizations: { 'en-US': '🌿 | Plants' },
                  value: 'plants',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  category: 'economy',
  authorDataFields: [
    'estrelinhas',
    'demons',
    'giants',
    'angels',
    'archangels',
    'gods',
    'demigods',
    'colors',
    'rolls',
    'inUseItems',
    'inventory',
    'selectedColor',
    'badges',
  ],
  commandRelatedExecutions: [
    executeBuyColorSelectComponent,
    executeSelectItem,
    executeClickButton,
    executeBuyImagesSelectComponent,
    handleBuySeedsInteractions,
    executeActivateTheme,
  ],
  execute: async (ctx, finishCommand) => {
    const subCommandGroup = ctx.getSubCommandGroup();

    if (subCommandGroup === 'vender') {
      const subCommand = ctx.getSubCommand();

      if (subCommand === 'caças') return sellHunts(ctx, finishCommand);

      if (subCommand === 'plantas') {
        const farmer = await farmerRepository.getFarmer(ctx.user.id);
        return finishCommand(buildSellPlantsMessage(ctx, farmer, ctx.authorData.selectedColor));
      }
    }

    if (subCommandGroup === 'comprar') {
      const subCommand = ctx.getSubCommand();

      if (subCommand === 'cores') return buyColor(ctx, finishCommand);

      if (subCommand === 'rolls') return buyRolls(ctx, finishCommand);

      if (subCommand === 'imagens') return buyImages(ctx, finishCommand);

      if (subCommand === 'itens') return buyItems(ctx, finishCommand);

      if (subCommand === 'temas') return buyThemes(ctx, finishCommand);

      if (subCommand === 'sementes') return buySeeds(ctx, finishCommand);
    }

    if (subCommandGroup === 'preços') {
      const subCommand = ctx.getSubCommand();

      if (subCommand === 'comprar') return buyInfo(ctx, finishCommand);

      if (subCommand === 'vender') return sellInfo(ctx, finishCommand);
    }
  },
});

export default ShopCommand;
