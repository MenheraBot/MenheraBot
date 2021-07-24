import { MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class MamarCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'mamar',
      aliases: ['suck', 'sugada'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext) {
    const mention = ctx.message.mentions.users.first();

    if (!mention) return ctx.replyT('error', 'commands:mamar.no-mention');

    if (mention.bot) return ctx.reply('warn', `${ctx.locale('commands:mamar.bot')} ${mention}`);

    if (mention === ctx.message.author) return ctx.replyT('error', 'commands:mamar.self-mention');

    const rand = await http.getAssetImageUrl('mamar');
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:mamar.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:mamar.embed_description')} ${mention}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
    await ctx.client.repositories.mamarRepository.mamar(ctx.message.author.id, mention.id);
  }
}
