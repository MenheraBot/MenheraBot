import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { emojis } from '@structures/Constants';

export default class GadoInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'gado',
      description:
        '「🐂」・MUUUUu gado demais. Use esse comando naquele seu amigo que baba por egirl',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para usar como gado',
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

    const res = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'gado',
          data: { image: link },
        })
      : await HttpRequests.gadoRequest(link);
    if (res.err) {
      await ctx.defer({
        ephemeral: false,
        content: `${emojis.error} |  ${ctx.locale('common:http-error')}`,
      });
      return;
    }

    await ctx.defer({
      ephemeral: false,
      files: [new MessageAttachment(res.data, 'gado.png')],
    });
  }
}
