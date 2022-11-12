import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';

import { sellHunts } from '../../modules/shop/sellHunts';
import { buyColor } from '../../modules/shop/buyColor';
import { buyRolls } from '../../modules/shop/buyRolls';
import { buyItems } from '../../modules/shop/buyItems';
import { buyThemes } from '../../modules/shop/buyThemes';

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
          name: 'cores',
          nameLocalizations: { 'en-US': 'colors' },
          description: '「🌈」・Compre cores para dar um UP em seu perfil!',
          descriptionLocalizations: { 'en-US': '「🌈」・Buy colors to upgrade your profile!' },
          type: ApplicationCommandOptionTypes.SubCommand,
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
      description: '「💸」・ Venda suas caças',
      descriptionLocalizations: { 'en-US': '「💸」・ Sell your fighters' },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'tipo',
          nameLocalizations: { 'en-US': 'type' },
          description: 'Tipo de caça para vender',
          descriptionLocalizations: { 'en-US': 'Type of hunting to sell' },
          type: ApplicationCommandOptionTypes.String,
          required: true,
          choices: [
            {
              name: '😈 | Demônios',
              nameLocalizations: { 'en-US': '😈 | Demons' },
              value: 'demons',
            },
            {
              name: '👊 | Gigantes',
              nameLocalizations: { 'en-US': '👊 | Giants' },
              value: 'giants',
            },
            {
              name: '👼 | Anjos',
              nameLocalizations: { 'en-US': '👼 | Angels' },
              value: 'angels',
            },
            {
              name: '🧚‍♂️ | Arcanjos',
              nameLocalizations: { 'en-US': '🧚‍♂️ | Archangels' },
              value: 'archangels',
            },
            {
              name: '🙌 | Semideuses',
              nameLocalizations: { 'en-US': '🙌 | Demigods' },
              value: 'demigods',
            },
            {
              name: '✝️ | Deuses',
              nameLocalizations: { 'en-US': '✝️ | Gods' },
              value: 'gods',
            },
          ],
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
  execute: async (ctx, finishCommand) => {
    const subCommandGroup = ctx.getSubCommandGroup();

    if (!subCommandGroup) return sellHunts(ctx, finishCommand);

    if (subCommandGroup === 'comprar') {
      const subCommand = ctx.getSubCommand();

      if (subCommand === 'cores') return buyColor(ctx, finishCommand);

      if (subCommand === 'rolls') return buyRolls(ctx, finishCommand);

      if (subCommand === 'itens') return buyItems(ctx, finishCommand);

      if (subCommand === 'temas') return buyThemes(ctx, finishCommand);
    }
  },
});

export default ShopCommand;
