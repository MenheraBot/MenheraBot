import { MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class PunchCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'punch',
      aliases: ['socar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const rand = await http.getAssetImageUrl('punch');
    const user = ctx.message.mentions.users.first();

    if (user && user.bot) {
      await ctx.replyT('error', 'commands:punch.bot');
      return;
    }

    if (!user) {
      await ctx.replyT('error', 'commands:punch.no-mention');
      return;
    }
    if (user === ctx.message.author) {
      await ctx.replyT('error', 'commands:punch.self-mention');
      return;
    }

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:punch.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:punch.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    await ctx.send(embed);
  }
}
