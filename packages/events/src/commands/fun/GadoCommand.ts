import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import { getUserAvatar } from '../../utils/discord/userUtils';
import { createCommand } from '../../structures/command/createCommand';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';

const GadoCommand = createCommand({
  path: '',
  name: 'gado',
  nameLocalizations: { 'en-US': 'simp' },
  description: '「🐂」・MUUUUu gado demais. Use esse comando naquele seu amigo que baba por egirl',
  descriptionLocalizations: {
    'en-US':
      '「🐂」・Mooo what a simp. Use this command on that friend of yours who drools over egirls',
  },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário para chamar de gado',
      descriptionLocalizations: { 'en-US': 'User to call a simp' },
      required: true,
    },
  ],
  category: 'fun',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const link = ctx.getOption<User>('user', 'users', true);

    await ctx.defer();

    const res = await vanGoghRequest(VanGoghEndpoints.Gado, {
      image: getUserAvatar(link, { enableGif: false, size: 512 }),
    });

    if (res.err) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:http-error'),
      });
      return finishCommand();
    }

    await ctx.makeMessage({
      file: {
        name: 'gado-dimaaais.png',
        blob: res.data,
      },
    });

    finishCommand();
  },
});

export default GadoCommand;
