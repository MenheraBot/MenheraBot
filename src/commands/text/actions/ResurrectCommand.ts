import CommandContext from '@structures/CommandContext';

import { MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';

export default class ResurrectCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'resurrect',
      aliases: ['reviver', 'ressuscitar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const rand = await http.getAssetImageUrl('resurrect');
    const user = ctx.message.mentions.users.first();
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (!user) {
      await ctx.replyT('question', 'commands:resurrect.no-mention');
      return;
    }

    if (user === ctx.message.author) {
      await ctx.replyT('question', 'commands:resurrect.no-mention');
      return;
    }

    if (user.bot) {
      await ctx.replyT('success', 'commands:resurrect.bot');
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:resurrect.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:resurrect.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    await ctx.send(embed);
  }
}
