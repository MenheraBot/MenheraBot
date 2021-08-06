import { MessageEmbed } from 'discord.js';
import Command from '@structures/command/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class GrumbleCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'grumble',
      aliases: ['resmungar', 'humpf'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const rand = await http.getAssetImageUrl('grumble');

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:grumble.embed_title'))
      .setColor('#000000')
      .setDescription(`${ctx.message.author} ${ctx.locale('commands:grumble.embed_description')}`)
      .setThumbnail(avatar)
      .setImage(rand)
      .setAuthor(ctx.message.author.tag, avatar);

    await ctx.send(embed);
  }
}
