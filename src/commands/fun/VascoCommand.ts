import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import { toWritableUTF } from '@utils/Util';
import { PicassoRoutes, requestPicassoImage } from '@utils/PicassoRequests';

export default class VascoCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'vasco',
      description: '「🏴」・The Giant Is Here! Brazilian meme about soccer',
      descriptionLocalizations: {
        'pt-BR': '「🏴」・O Giante Está aqui! Bem Vindo ao time!',
      },
      options: [
        {
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          type: 'USER',
          description: 'User who joined vasco',
          descriptionLocalizations: { 'pt-BR': 'Usuário que entrou pro vasco' },
          required: true,
        },
        {
          name: 'quality',
          nameLocalizations: { 'pt-BR': 'qualidade' },
          type: 'STRING',
          description: 'Image quality (Good for low quality memes)',
          descriptionLocalizations: { 'pt-BR': 'Qualidade da imagem (Boa pros memes lowquality)' },
          required: false,
          choices: [
            {
              name: '✨ | Normal',
              value: 'normal',
            },
            {
              name: '🥶 | Low',
              nameLocalizations: { 'pt-BR': '🥶 | Baixa' },
              value: 'low',
            },
          ],
        },
      ],
      category: 'fun',
      cooldown: 8,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);
    const quality = ctx.options.getString('quality') ?? 'normal';

    const randomPosition = `${Math.floor(Math.random() * 9)}`;

    const position = ctx.locale(`commands:vasco.positions.${randomPosition as '1'}`);

    await ctx.defer();

    const res = await requestPicassoImage(
      PicassoRoutes.Vasco,
      {
        user: user.displayAvatarURL({ format: 'png', size: quality === 'normal' ? 512 : 56 }),
        quality,
        username: toWritableUTF(user.username),
        position,
      },
      ctx,
    );

    if (res.err) {
      await ctx.defer({ content: `${emojis.error} | ${ctx.locale('common:http-error')}` });
      return;
    }

    await ctx.defer({
      files: [new MessageAttachment(res.data, 'vasco.png')],
    });
  }
}
