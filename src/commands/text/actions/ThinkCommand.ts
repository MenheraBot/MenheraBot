import { MessageEmbed } from 'discord.js';
import Command from '@structures/command/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class ThinksCOmmand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'think',
      aliases: ['pensar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const rand = await http.getAssetImageUrl('think');
    const user = ctx.message.mentions.users.first();
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (user && user.bot) {
      await ctx.replyT('success', 'commands:think.bot');
      return;
    }

    if (!user || user === ctx.message.author) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:think.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(
          `${ctx.message.author} ${ctx.locale('commands:think.no-mention.embed_description')}`,
        )
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(ctx.message.author.tag, avatar);

      await ctx.send(embed);
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:think.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:think.embed_description')} ${user} hehehehe`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    await ctx.send(embed);
  }
}
