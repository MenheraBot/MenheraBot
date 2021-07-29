import { Message, MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
import http from '../../utils/HTTPrequests';

export default class BiteCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'bite',
      aliases: ['morder'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<Message> {
    const rand = await http.getAssetImageUrl('bite');
    const user = ctx.message.mentions.users.first();

    if (user && user.bot) return ctx.replyT('warn', 'commands:bite.bot');

    if (!user) {
      return ctx.replyT('error', 'commands:bite.no-mention');
    }

    if (user === ctx.message.author) {
      return ctx.replyT('error', 'commands:bite.self-mention');
    }

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:bite.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:bite.embed_description')} ${user} :3`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    return ctx.send(embed);
  }
}
