import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import { toWritableUTF } from '@utils/Util';
import { PicassoRoutes, requestPicassoImage } from '@utils/PicassoRequests';

export default class MacetavaCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'macetava',
      description: '「🤠」・Sabe o meme do macetava do casas bahia? É exatamente isso',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para mostrar na imagem',
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const link = ctx.options.getUser('user', true).displayAvatarURL({
      format: 'png',
      size: 512,
    });
    await ctx.defer();

    const res = await requestPicassoImage(
      PicassoRoutes.Macetava,
      {
        image: link,
        authorName: toWritableUTF(ctx.author.username),
        authorDiscriminator: ctx.author.discriminator,
        authorImage: ctx.author.displayAvatarURL({ format: 'png', size: 512 }),
      },
      ctx,
    );

    if (res.err) {
      await ctx.defer({ content: `${emojis.error} | ${ctx.locale('common:http-error')}` });
      return;
    }

    await ctx.defer({
      files: [new MessageAttachment(res.data, 'macetava.png')],
    });
  }
}
