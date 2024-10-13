import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';
import eventRepository from '../../database/repositories/eventRepository';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';

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

    const embed = createEmbed({
      title: ctx.prettyResponse('cempasuchil', 'events:dia-dos-mortos.embed-title'),
      description: ctx.locale('events:dia-dos-mortos.currency', { currency: userEvents.currency }),
      color: hexStringToNumber(ctx.authorData.selectedColor),
    });

    await ctx.makeMessage({
      embeds: [embed],
    });
  },
});

export default DiaDeMuertosCommand;
