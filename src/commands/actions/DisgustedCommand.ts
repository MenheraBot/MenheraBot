import { MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class DisgustedCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'disgusted',
      aliases: ['nojo'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const rand = await http.getAssetImageUrl('disgusted');
    const user = ctx.message.mentions.users.first();
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (user && user.bot) {
      await ctx.replyT('error', 'commands:disgusted.bot');
      return;
    }

    if (!user || user.id === ctx.message.author.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:disgusted.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(
          `${ctx.message.author} ${ctx.locale('commands:disgusted.no-mention.embed_description')}`,
        )
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(ctx.message.author.tag, avatar);
      await ctx.send(embed);
      return;
    }

    const embed = new MessageEmbed()
      .setTitle('Nojo')
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:disgusted.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    await ctx.send(embed);
  }
}
