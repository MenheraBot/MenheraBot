import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import { PicassoRoutes, requestPicassoImage } from '@utils/PicassoRequests';

export default class GadoCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'gado',
      nameLocalizations: { 'pt-BR': 'gado' },
      description: '「🐂」・Brazilian meme about someone simping',
      descriptionLocalizations: {
        'pt-BR':
          '「🐂」・MUUUUu gado demais. Use esse comando naquele seu amigo que baba por egirl',
      },
      options: [
        {
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          type: 'USER',
          description: 'User to call a simp',
          descriptionLocalizations: { 'pt-BR': 'Usuário para chamar de gado' },
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    await ctx.defer();

    const link = ctx.options.getUser('user', true).displayAvatarURL({
      format: 'png',
      size: 512,
    });

    const res = await requestPicassoImage(PicassoRoutes.Gado, { image: link }, ctx);

    if (res.err) {
      await ctx.defer({
        content: `${emojis.error} |  ${ctx.locale('common:http-error')}`,
      });
      return;
    }

    await ctx.defer({
      files: [new MessageAttachment(res.data, 'gado.png')],
    });
  }
}
