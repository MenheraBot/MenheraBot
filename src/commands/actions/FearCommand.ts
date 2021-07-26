import CommandContext from '@structures/CommandContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';

export default class FearCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'fear',
      aliases: ['medo'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext) {
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const rand = await http.getAssetImageUrl('fear');
    const user = ctx.message.mentions.users.first();

    if (!user || user?.id === ctx.message.author.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:fear.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(
          `${ctx.message.author} ${ctx.locale('commands:fear.no-mention.embed_description')}`,
        )
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(ctx.message.author.tag, avatar);

      return ctx.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:fear.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:fear.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    await ctx.send(embed);
  }
}
