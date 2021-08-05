import CommandContext from '@structures/CommandContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '../../../structures/Command';
import http from '../../../utils/HTTPrequests';

export default class HugCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'hug',
      aliases: ['abracar', 'abraçar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const rand = await http.getAssetImageUrl('hug');
    const user = ctx.message.mentions.users.first();

    if (user && user.bot) {
      await ctx.replyT('error', 'commands:hug.bot');
      return;
    }

    if (!user) {
      await ctx.replyT('error', 'commands:hug.no-mention');
      return;
    }

    if (user === ctx.message.author) {
      await ctx.replyT('error', 'commands:hug.self-mention');
      return;
    }

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:hug.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:hug.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    await ctx.send(embed);
  }
}
