import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';
import { emojis } from '@structures/MenheraConstants';

export default class AstolfoInteractionCommand extends InteractionCommand {
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
    const text = ctx.options.getString('frase', true);
    await ctx.interaction.deferReply().catch(() => null);

    const res = await HttpRequests.astolfoRequest(text);

    if (res.err) {
      await ctx.editReply({ content: `${emojis.error} | ${ctx.locale('commands:http-error')}` });
      return;
    }

    await ctx.editReply({
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'astolfo.png')],
    });
  }
}
