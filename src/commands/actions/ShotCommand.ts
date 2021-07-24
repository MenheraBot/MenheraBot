import { MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class ShotCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'shot',
      aliases: ['atirar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext) {
    const rand = await http.getAssetImageUrl('shot');
    const user = ctx.message.mentions.users.first();

    if (!user) return ctx.replyT('error', 'commands:shot.no-mention');

    if (user === ctx.message.author) return ctx.replyT('error', 'commands:shot.self-mention');

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:shot.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:shot.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
  }
}
