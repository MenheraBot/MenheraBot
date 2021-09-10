import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';

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

    const res = await HttpRequests.macetavaRequest(
      link,
      ctx.author.username,
      ctx.author.discriminator,
      ctx.author.displayAvatarURL({ format: 'png', size: 512 }),
    );

    if (res.err) {
      await ctx.replyT('error', 'commands:http-error', {}, true);
      return;
    }

    await ctx.reply({
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'macetava.png')],
    });
  }
}
