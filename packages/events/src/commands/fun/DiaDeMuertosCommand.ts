import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';
import eventRepository from '../../database/repositories/eventRepository';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { CempasuchilPlant, Plants } from '../../modules/fazendinha/constants';
import { createCustomId, createSelectMenu } from '../../utils/discord/componentUtils';

const buyableItems = [
  {
    id: 'event-title' as const,
    oneTime: true,
    price: 10,
  },
  {
    id: 'event-badge' as const,
    oneTime: true,
    price: 20,
  },
];

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
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const userEvents = await eventRepository.getUser(ctx.user.id);

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
        currency: ctx.locale('events:dia-dos-mortos.currency', { currency: userEvents.currency }),
      }),
      color: hexStringToNumber(ctx.authorData.selectedColor),
      fields: buyableItems.map((item) => {
        // TODO: Check if is oneTime and user already got it.
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
    });

    await ctx.makeMessage({
      embeds: [embed],
      // TODO: If it has more than one option, send the select menu
    });
  },
});

export default DiaDeMuertosCommand;
