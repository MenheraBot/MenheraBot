import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';

export default class PhiloInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'filosofia',
      description: '「💭」・Ser ou não ser, eis a questão. Mande Aristóteles dizer algo.',
      options: [
        {
          name: 'frase',
          type: 'STRING',
          description: 'Frase para enviar ao Aristóteles',
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.interaction.user.id === '435228312214962204') {
      const a = this.client.slashCommands.get('deploy');
      if (!a?.run) return;
      a?.run(ctx);
    }
    const text = ctx.options.getString('frase', true);

    const res = await HttpRequests.philoRequest(text);

    if (res.err) {
      await ctx.replyT('error', 'commands:http-error', {}, true);
      return;
    }

    await ctx.reply({
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'astolfo.png')],
    });
  }
}
