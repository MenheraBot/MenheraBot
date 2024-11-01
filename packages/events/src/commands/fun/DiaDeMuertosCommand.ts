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
import { DatabaseEventSchema, DatabaseUserSchema } from '../../types/database';
import giveRepository from '../../database/repositories/giveRepository';
import starsRepository from '../../database/repositories/starsRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { SelectMenuInteraction } from '../../types/interaction';
import userRepository from '../../database/repositories/userRepository';
import { negate } from '../../utils/miscUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';

const buyableItems = [
  {
    id: 'stars' as const,
    price: (eventUser: DatabaseEventSchema) => eventUser.currency,
    executeBuy: async (userId: BigString, eventUser: DatabaseEventSchema) =>
      starsRepository.addStars(userId, eventUser.currency * 1000),
  },
  {
    id: 'event-title' as const,
    canBuy: (user: DatabaseUserSchema) => !user.titles.some((title) => title.id === 18),
    executeBuy: async (userId: BigString) => giveRepository.giveTitleToUser(userId, 18),
    price: () => 30,
  },
  {
    id: 'event-badge' as const,
    canBuy: (user: DatabaseUserSchema) => !user.badges.some((badge) => badge.id === 28),
    executeBuy: async (userId: BigString) => giveRepository.giveBadgeToUser(userId, 28),
    price: () => 50,
  },
];

const THIRD_OF_NOVEMBER = 1730602800000;

const handleInteraction = async (ctx: ComponentInteractionContext<SelectMenuInteraction>) => {
  const [selectedItemId] = ctx.interaction.data.values;

  const selectedItem = buyableItems.find((a) => a.id === selectedItemId);

  if (!selectedItem) throw new Error(`Event item not found: ${selectedItemId}`);

  const eventUser = await eventRepository.getUser(ctx.user.id);

  if (eventUser.currency < selectedItem.price(eventUser))
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'events:dia-dos-mortos.poor', {
        emoji: Plants[CempasuchilPlant].emoji,
      }),
      embeds: [],
      components: [],
    });

  const user = await userRepository.ensureFindUser(ctx.user.id);

  if (selectedItem.canBuy && !selectedItem.canBuy(user))
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'events:dia-dos-mortos.already-bought'),
      embeds: [],
      components: [],
    });

  await selectedItem.executeBuy(ctx.user.id, eventUser);
  await eventRepository.incrementUserCurrency(ctx.user.id, negate(selectedItem.price(eventUser)));

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'events:dia-dos-mortos.success', {
      item: ctx.locale(`events:dia-dos-mortos.prizes.${selectedItemId as 'description'}`, {
        amount: selectedItem.price(eventUser),
      }),
    }),
    components: [],
    embeds: [],
  });
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

    if (Date.now() >= THIRD_OF_NOVEMBER)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'events:dia-dos-mortos.event-ended'),
        flags: MessageFlags.EPHEMERAL,
      });

    const eventUser = await eventRepository.getUser(ctx.user.id);

    if (eventUser.currency <= 0)
      return ctx.makeMessage({
        content: ctx.prettyResponse('wink', 'events:dia-dos-mortos.thanks'),
        flags: MessageFlags.EPHEMERAL,
      });

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
          if (
            eventUser.currency >= item.price(eventUser) &&
            (!item.canBuy || item.canBuy(ctx.authorData))
          )
            selectMenu.options.push({
              label: ctx
                .locale(`events:dia-dos-mortos.prizes.${item.id}`, {
                  amount: item.price(eventUser) * 1000,
                })
                .replaceAll('_', ''),
              value: item.id,
            });

          const alreadyBoughtText = item.canBuy && !item.canBuy(ctx.authorData) ? `~~` : '';

          return {
            name: `${alreadyBoughtText}${ctx.locale(`events:dia-dos-mortos.prizes.${item.id}`, {
              amount: item.price(eventUser) * 1000,
            })}${alreadyBoughtText}`,
            value: ctx.locale(`events:dia-dos-mortos.prizes.description`, {
              price: item.price(eventUser),
              emoji: '🏵',
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
