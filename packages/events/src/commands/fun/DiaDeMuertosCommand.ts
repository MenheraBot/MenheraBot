import { ApplicationCommandOptionTypes, BigString } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';
import eventRepository from '../../database/repositories/eventRepository';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { CempasuchilPlant, Plants } from '../../modules/fazendinha/constants';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
} from '../../utils/discord/componentUtils';
import { DatabaseUserSchema } from '../../types/database';
import giveRepository from '../../database/repositories/giveRepository';
import starsRepository from '../../database/repositories/starsRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../types/interaction';

const buyableItems = [
  {
    id: 'stars' as const,
    price: 1,
    executeBuy: async (userId: BigString) => starsRepository.addStars(userId, 1000),
  },
  {
    id: 'event-title' as const,
    canBuy: (user: DatabaseUserSchema) => !user.titles.some((title) => title.id === 18),
    executeBuy: async (userId: BigString) => giveRepository.giveTitleToUser(userId, 18),
    price: 30,
  },
  {
    id: 'event-badge' as const,
    canBuy: (user: DatabaseUserSchema) => !user.badges.some((badge) => badge.id === 28),
    executeBuy: async (userId: BigString) => giveRepository.giveBadgeToUser(userId, 28),
    price: 50,
  },
];

const handleInteraction = async (ctx: ComponentInteractionContext<SelectMenuInteraction>) => {
  const [selectedItemId] = ctx.interaction.data.values;

  const selectedItem = buyableItems.find((a) => a.id === selectedItemId);

  if (!selectedItem) throw new Error(`Event item not found: ${selectedItemId}`);

  const eventUser = await eventRepository.getUser(ctx.user.id);

  if (eventUser.currency < selectedItem.price)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'events:dia-dos-mortos.poor', {
        emoji: Plants[CempasuchilPlant].emoji,
      }),
    });

  // TODO(ySnoopyDogy): DO IT!
};

const DiaDeMuertosCommand = createCommand({
  path: '',
  name: 'dia',
  nameLocalizations: { 'en-US': 'dia' },
  description: '「💀」・Comemore o dia dos mortos mexicano',
  descriptionLocalizations: {
    'en-US': '「💀」・Celebrate the Mexican Day of the Dead',
  },
  options: [
    {
      name: 'dos',
      nameLocalizations: { 'en-US': 'de' },
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      description: '「💀」・Comemore o dia dos mortos mexicano',
      descriptionLocalizations: {
        'en-US': '「💀」・Celebrate the Mexican Day of the Dead',
      },
      options: [
        {
          name: 'mortos',
          nameLocalizations: { 'en-US': 'muertos' },
          type: ApplicationCommandOptionTypes.SubCommand,
          description: '「💀」・Comemore o dia dos mortos mexicano',
          descriptionLocalizations: {
            'en-US': '「💀」・Celebrate the Mexican Day of the Dead',
          },
        },
      ],
    },
  ],
  category: 'fun',
  commandRelatedExecutions: [handleInteraction],
  authorDataFields: ['selectedColor', 'titles', 'badges'],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const eventUser = await eventRepository.getUser(ctx.user.id);

    const selectMenu = createSelectMenu({
      customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'BUY'),
      options: [],
      minValues: 1,
      maxValues: 1,
      placeholder: ctx.locale('events:dia-dos-mortos.select-one'),
    });

    const embed = createEmbed({
      title: ctx.prettyResponse('cempasuchil', 'events:dia-dos-mortos.embed-title'),
      description: ctx.locale('events:dia-dos-mortos.embed-description', {
        currency: ctx.locale('events:dia-dos-mortos.currency', { currency: eventUser.currency }),
      }),
      color: hexStringToNumber(ctx.authorData.selectedColor),
      fields: await Promise.all(
        buyableItems.map(async (item) => {
          if (eventUser.currency >= item.price && (!item.canBuy || item.canBuy(ctx.authorData)))
            selectMenu.options.push({
              label: ctx.locale(`events:dia-dos-mortos.prizes.${item.id}`),
              value: item.id,
            });

          return {
            name: ctx.locale(`events:dia-dos-mortos.prizes.${item.id}`),
            value: ctx.locale(`events:dia-dos-mortos.prizes.description`, {
              price: item.price,
              emoji: Plants[CempasuchilPlant].emoji,
            }),
            inline: true,
          };
        }),
      ),
    });

    await ctx.makeMessage({
      embeds: [embed],
      components: selectMenu.options.length > 0 ? [createActionRow([selectMenu])] : undefined,
    });
  },
});

export default DiaDeMuertosCommand;
