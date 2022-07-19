import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import { toWritableUTF } from '@utils/Util';
import { VangoghRoutes, requestVangoghImage } from '@utils/VangoghRequests';

export default class VascoCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'vasco',
      description: '「🏴」・O Giante Está aqui! Bem Vindo ao time!',
      descriptionLocalizations: {
        'en-US': '「🏴」・The Giant Is Here! Brazilian meme about soccer',
      },
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário que entrou pro vasco',
          descriptionLocalizations: { 'en-US': 'User who joined vasco' },
          required: true,
        },
        {
          name: 'qualidade',
          nameLocalizations: { 'en-US': 'quality' },
          type: 'STRING',
          description: 'Qualidade da imagem (Boa pros memes lowquality)',
          descriptionLocalizations: { 'en-US': 'Image quality (Good for low quality memes)' },
          required: false,
          choices: [
            {
              name: '✨ | Normal',
              value: 'normal',
            },
            { name: '🥶 | Baixa', nameLocalizations: { 'en-US': '🥶 | Low' }, value: 'low' },
          ],
        },
      ],
      category: 'fun',
      cooldown: 8,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);
    const quality = ctx.options.getString('qualidade') ?? 'normal';

    const randomPosition = `${Math.floor(Math.random() * 9)}`;

    const position = ctx.locale(`commands:vasco.positions.${randomPosition as '1'}`);

    const res = await requestVangoghImage(VangoghRoutes.Vasco, {
      user: user.displayAvatarURL({ format: 'png', size: quality === 'normal' ? 256 : 64 }),
      quality,
      username: toWritableUTF(user.username),
      position,
    });

    if (res.err) {
      await ctx.makeMessage({ content: `${emojis.error} | ${ctx.locale('common:http-error')}` });
      return;
    }

    await ctx.makeMessage({
      files: [new MessageAttachment(res.data, 'vasco.png')],
    });
  }
}