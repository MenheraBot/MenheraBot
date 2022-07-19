import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import { VangoghRoutes, requestVangoghImage } from '@utils/VangoghRequests';

export default class GadoCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'gado',
      nameLocalizations: { 'en-US': 'simp' },
      description:
        '「🐂」・MUUUUu gado demais. Use esse comando naquele seu amigo que baba por egirl',
      descriptionLocalizations: {
        'en-US':
          '「🐂」・Mooo what a simp. Use this command on that friend of yours who drools over egirls',
      },
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para chamar de gado',
          descriptionLocalizations: { 'en-US': 'User to call a simp' },
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

    const res = await requestVangoghImage(VangoghRoutes.Gado, { image: link });

    if (res.err) {
      await ctx.makeMessage({
        content: `${emojis.error} |  ${ctx.locale('common:http-error')}`,
      });
      return;
    }

    await ctx.makeMessage({
      files: [new MessageAttachment(res.data, 'gado.png')],
    });
  }
}
