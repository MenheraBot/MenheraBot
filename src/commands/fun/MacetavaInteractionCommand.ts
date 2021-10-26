import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { emojis } from '@structures/Constants';

export default class MacetavaInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
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
      clientPermissions: ['ATTACH_FILES'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const link = ctx.options.getUser('user', true).displayAvatarURL({
      format: 'png',
      size: 512,
    });
    await ctx.defer();

    const res = this.client.picassoWs.isAlive
      ? await this.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'macetava',
          data: {
            image: link,
            authorName: ctx.author.username,
            authorDiscriminator: ctx.author.discriminator,
            authorImage: ctx.author.displayAvatarURL({ format: 'png', size: 512 }),
          },
        })
      : await HttpRequests.macetavaRequest(
          link,
          ctx.author.username,
          ctx.author.discriminator,
          ctx.author.displayAvatarURL({ format: 'png', size: 512 }),
        );

    if (res.err) {
      await ctx.defer({ content: `${emojis.error} | ${ctx.locale('commands:http-error')}` });
      return;
    }

    await ctx.defer({
      files: [new MessageAttachment(res.data, 'macetava.png')],
    });
  }
}
