import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';
import { emojis } from '@structures/Constants';

export default class VascoInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'vasco',
      description: '「🏴」・O Giante Está aqui! Bem Vindo ao time!',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que entrou pro vasco',
          required: true,
        },
        {
          name: 'qualidade',
          type: 'STRING',
          description: 'Qualidade da imagem (Boa pros memes lowquality)',
          required: false,
          choices: [
            {
              name: '✨ | Normal',
              value: 'normal',
            },
            {
              name: '🥶 | Baixa',
              value: 'low',
            },
          ],
        },
      ],
      category: 'fun',
      cooldown: 8,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);
    const quality = ctx.options.getString('qualidade') ?? 'normal';

    await ctx.defer();

    const res = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'vasco',
          data: { user: user.displayAvatarURL(), quality, username: user.username },
        })
      : await HttpRequests.vascoRequest(user.displayAvatarURL(), quality, user.username);

    if (res.err) {
      await ctx.defer({ content: `${emojis.error} | ${ctx.locale('commands:http-error')}` });
      return;
    }

    await ctx.defer({
      files: [new MessageAttachment(res.data, 'vasco.png')],
    });
  }
}
