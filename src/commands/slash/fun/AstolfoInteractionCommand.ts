import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';

export default class EightballInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'astolfo',
      description: '「🍆」・É grande, né? Disse o asolfo para aquilo que você o disse',
      options: [
        {
          name: 'frase',
          type: 'STRING',
          description: 'Frase para enviar ao astolfo',
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const text = ctx.args[0].value as string;

    const res = await HttpRequests.astolfoRequest(text);

    if (res.err) {
      await ctx.replyT('error', 'commands:http-error', {}, true);
      return;
    }

    await ctx.reply({
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'astolfo.png')],
    });
  }
}
