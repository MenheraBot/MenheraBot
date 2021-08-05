import { MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class BicudaCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'bicuda',
      aliases: ['chutar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const rand = await http.getAssetImageUrl('bicuda');
    const user = ctx.message.mentions.users.first();

    if (!user) {
      await ctx.replyT('error', 'commands:bicuda.no-mention');
      return;
    }

    if (user && user.bot) {
      await ctx.replyT('warn', 'commands:bicuda.bot');
      return;
    }

    if (user === ctx.message.author) {
      await ctx.replyT('error', 'commands:bicuda.self-mention');
      return;
    }

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:bicuda.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:bicuda.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    await ctx.send(embed);
  }
}
