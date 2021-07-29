import { Message, MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class PatCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'pat',
      aliases: ['carinho', 'cuddle'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx: CommandContext): Promise<Message> {
    const rand = await http.getAssetImageUrl('pat');
    const user = ctx.message.mentions.users.first();

    if (!user) return ctx.replyT('error', 'commands:pat.no-mention');

    if (user === ctx.message.author) return ctx.replyT('error', 'commands:pat.self-mention');

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

    return ctx.send(embed);
  }
}
