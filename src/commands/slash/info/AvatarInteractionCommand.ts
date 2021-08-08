/* eslint-disable no-unused-expressions */
import { MessageEmbed } from 'discord.js';
import 'moment-duration-format';
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

    const mentionUser = ctx.args[0]?.user;
    if (mentionUser && mentionUser.id !== ctx.interaction.user.id) {
      try {
        user = await this.client.users.fetch(mentionUser.id);
        db = await this.client.repositories.userRepository.find(user.id);
      } catch {
        await ctx.replyT('error', 'commands:avatar.unknow-user');
        return;
      }
    }

    const cor = db?.cor ?? ('#a788ff' as const);

    const img = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:avatar.title', { user: user.username }))
      .setImage(img)
      .setColor(cor)
      .setFooter(ctx.locale('commands:avatar.footer'));

    if (user.id === this.client.user?.id) {
      embed.setTitle(ctx.locale('commands:avatar.client_title', { user: user.username }));
      embed.setColor('#f276f3');
      embed.setFooter(ctx.locale('commands:avatar.client_footer', { user: user.username }));
    }
    await ctx.reply({ embeds: [embed] });
  }
}
