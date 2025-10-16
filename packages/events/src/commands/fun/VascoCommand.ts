import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest.js';

const VascoCommand = createCommand({
  path: '',
  name: 'vasco',
  description: '「🏴」・O Giante Está aqui! Bem Vindo ao time!',
  descriptionLocalizations: {
    'en-US': '「🏴」・The Giant Is Here! Brazilian meme about soccer',
  },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário que entrou pro vasco',
      descriptionLocalizations: { 'en-US': 'User who joined vasco' },
      required: true,
    },
    {
      name: 'qualidade',
      nameLocalizations: { 'en-US': 'quality' },
      type: ApplicationCommandOptionTypes.String,
      description: 'Qualidade da imagem (Boa pros memes lowquality)',
      descriptionLocalizations: { 'en-US': 'Image quality (Good for low quality memes)' },
      required: false,
      choices: [
        {
          name: '✨ | Normal',
          value: 'normal',
        },
        { name: '🥶 | Baixa', nameLocalizations: { 'en-US': '🥶 | Low' }, value: 'low' },
      ],
    },
  ],
  category: 'fun',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', true);
    const quality = ctx.getOption<string>('qualidade', false) ?? 'normal';

    const randomPosition = `${Math.floor(Math.random() * 9)}`;

    const position = ctx.locale(`commands:vasco.positions.${randomPosition as '1'}`);

    await ctx.defer();

    const res = await vanGoghRequest(VanGoghEndpoints.Vasco, {
      user: getUserAvatar(user, { size: quality === 'normal' ? 256 : 64 }),
      quality,
      username: getDisplayName(user, true),
      position,
    });

    if (res.err) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:http-error'),
      });

      return finishCommand();
    }

    await ctx.makeMessage({
      file: {
        name: 'vasco.png',
        blob: res.data,
      },
    });

    finishCommand();
  },
});

export default VascoCommand;
