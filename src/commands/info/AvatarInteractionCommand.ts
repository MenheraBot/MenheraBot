/* eslint-disable no-unused-expressions */
import { MessageEmbed } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { IUserSchema } from '@utils/Types';

export default class AvatarInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'avatar',
      description: '「📸」・Mostra a foto de perfil de alguém',
      category: 'info',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'Usuário para mostrar a foto de perfil',
          required: false,
        },
      ],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorData = ctx.data.user;

    let { user } = ctx.interaction;
    let db: IUserSchema | null = authorData;

    const mentionUser = ctx.options.getUser('user');

    if (mentionUser && mentionUser.id !== ctx.author.id) {
      try {
        user = await this.client.users.fetch(mentionUser.id);
        db = await this.client.repositories.userRepository.find(user.id);
      } catch {
        await ctx.replyT('error', 'unknow-user', {}, true);
        return;
      }
    }

    const cor = db?.cor ?? ('#a788ff' as const);

    const img = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('title', { user: user.username }))
      .setImage(img)
      .setColor(cor)
      .setFooter(ctx.translate('footer'));

    if (user.id === this.client.user?.id) {
      embed.setTitle(ctx.translate('client_title', { user: user.username }));
      embed.setColor('#f276f3');
      embed.setFooter(ctx.translate('client_footer', { user: user.username }));
    }
    await ctx.reply({ embeds: [embed] });
  }
}
