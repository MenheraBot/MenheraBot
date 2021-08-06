import { MessageEmbed } from 'discord.js';
import Command from '@structures/command/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class CryCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'cry',
      aliases: ['chorar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const rand = await http.getAssetImageUrl('cry');
    const user = ctx.message.mentions.users.first();

    if (user && user.bot) {
      await ctx.replyT('error', 'commands:cry.bot');
      return;
    }

    if (!user || user === ctx.message.author) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:cry.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(
          `${ctx.message.author} ${ctx.locale('commands:cry.no-mention.embed_description')}`,
        )
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(ctx.message.author.tag, avatar);

      await ctx.send(embed);
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:cry.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${user} ${ctx.locale('commands:cry.embed_description_start')}
         ${ctx.message.author} ${ctx.locale('commands:cry.embed_description_end')}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    await ctx.send(embed);
  }
}
