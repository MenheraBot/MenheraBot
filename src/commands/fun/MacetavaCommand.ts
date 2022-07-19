import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import { toWritableUTF } from '@utils/Util';
import { VangoghRoutes, requestVangoghImage } from '@utils/VangoghRequests';

export default class MacetavaCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'macetava',
      description: '「🤠」・Sabe o meme do macetava do casas bahia? É exatamente isso',
      descriptionLocalizations: { 'en-US': '「🤠」・Just a brazilian meme for brazilians' },
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para mostrar na imagem',
          descriptionLocalizations: { 'en-US': 'User to show in the picture' },
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

    const res = await requestVangoghImage(VangoghRoutes.Macetava, {
      image: link,
      authorName: toWritableUTF(ctx.author.username),
      authorDiscriminator: ctx.author.discriminator,
      authorImage: ctx.author.displayAvatarURL({ format: 'png', size: 128 }),
    });

    if (res.err) {
      await ctx.makeMessage({ content: `${emojis.error} | ${ctx.locale('common:http-error')}` });
      return;
    }

    await ctx.makeMessage({
      files: [new MessageAttachment(res.data, 'macetava.png')],
    });
  }
}
