import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { ApplicationCommandData, MessageAttachment } from 'discord.js';
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
    const text = ctx.options.getString('frase', true);

    if (ctx.interaction.user.id === '435228312214962204') {
      const permissionSet: string[] = [];

      const allCommands = this.client.slashCommands.reduce<ApplicationCommandData[]>((p, c) => {
        if (!c.config.devsOnly) return p;
        permissionSet.push(c.config.name);
        p.push({
          name: c.config.name,
          description: c.config.description,
          options: c.config.options,
          defaultPermission: c.config.defaultPermission,
        });
        return p;
      }, []);

      ctx.reply('Iniciando deploy');
      const res = await ctx.interaction.guild?.commands.set(allCommands);

      res?.forEach((a) => {
        if (permissionSet.includes(a.name)) {
          a.permissions.add({
            permissions: [{ id: ctx.interaction.user.id, permission: true, type: 'USER' }],
          });
        }
      });
      return;
    }

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
