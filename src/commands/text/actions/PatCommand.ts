import { MessageEmbed } from 'discord.js';
import Command from '@structures/command/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class PatCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'pat',
      aliases: ['carinho', 'cuddle'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const rand = await http.getAssetImageUrl('pat');
    const user = ctx.message.mentions.users.first();

    if (!user) {
      await ctx.replyT('error', 'commands:pat.no-mention');
      return;
    }

    if (user === ctx.message.author) {
      await ctx.replyT('error', 'commands:pat.self-mention');
      return;
    }

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:pat.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:pat.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    await ctx.send(embed);
  }
}
