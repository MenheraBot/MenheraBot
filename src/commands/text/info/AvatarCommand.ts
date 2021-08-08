import { MessageEmbed } from 'discord.js';
import Command from '@structures/command/Command';
import Util from '@utils/Util';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';
import { IUserSchema } from '@utils/Types';

export default class AvatarCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'avatar',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'info',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const authorData = ctx.data.user;

    let user = ctx.message.author;
    let db: IUserSchema | null = authorData;

    const userId = Util.getIdByMention(ctx.args[0]);
    if (userId && userId !== ctx.message.author.id) {
      try {
        user = await this.client.users.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
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
    await ctx.sendC(ctx.message.author.toString(), embed);
  }
}
