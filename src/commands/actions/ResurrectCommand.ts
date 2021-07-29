import CommandContext from '@structures/CommandContext';

import { Message, MessageEmbed } from 'discord.js';
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

  async run(ctx: CommandContext): Promise<Message> {
    const rand = await http.getAssetImageUrl('resurrect');
    const user = ctx.message.mentions.users.first();
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (!user) return ctx.replyT('question', 'commands:resurrect.no-mention');

    if (user === ctx.message.author) return ctx.replyT('question', 'commands:resurrect.no-mention');

    if (user.bot) return ctx.replyT('success', 'commands:resurrect.bot');

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:resurrect.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:resurrect.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    return ctx.send(embed);
  }
}
