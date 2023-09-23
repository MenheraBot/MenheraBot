import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import { createCommand } from '../../structures/command/createCommand';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';

const MacetavaCommand = createCommand({
  path: '',
  name: 'macetava',
  description: '「🤠」・Sabe o meme do macetava do casas bahia? É exatamente isso',
  descriptionLocalizations: { 'en-US': '「🤠」・Just a brazilian meme for brazilians' },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário para mostrar na imagem',
      descriptionLocalizations: { 'en-US': 'User to show in the picture' },
      required: true,
    },
  ],
  category: 'fun',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const link = ctx.getOption<User>('user', 'users', true);

    await ctx.defer();

    const res = await vanGoghRequest(VanGoghEndpoints.Macetava, {
      image: getUserAvatar(link, { enableGif: false, size: 512 }),
      authorName: ctx.author.username,
      authorDisplayName: getDisplayName(ctx.author, true),
      authorImage: getUserAvatar(ctx.author, { enableGif: false, size: 128 }),
    });

    if (res.err) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:http-error'),
      });
      return finishCommand();
    }

    await ctx.makeMessage({
      file: {
        name: 'macetava-afu.png',
        blob: res.data,
      },
    });

    finishCommand();
  },
});

export default MacetavaCommand;
