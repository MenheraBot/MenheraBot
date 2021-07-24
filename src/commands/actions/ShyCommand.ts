import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';

import { MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';

export default class ShyCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'shy',
      aliases: ['vergonha'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext) {
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const rand = await http.getAssetImageUrl('shy');
    const user = ctx.message.mentions.users.first();

    if (!user || user === ctx.message.author) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:shy.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(
          `${ctx.message.author} ${ctx.locale('commands:shy.no-mention.embed_description')}`,
        )
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(ctx.message.author.tag, avatar);

      return ctx.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:shy.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${user} ${ctx.locale('commands:shy.embed_description_start')} ${
          ctx.message.author
        } ${ctx.locale('commands:shy.embed_description_end')}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
  }
}
