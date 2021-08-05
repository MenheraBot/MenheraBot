import CommandContext from '@structures/CommandContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '../../../structures/Command';

export default class SuportCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'support',
      aliases: ['suporte'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'util',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:support.embed_title'))
      .setURL('https://discord.gg/fZMdQbA')
      .setColor('#970045')
      .setImage('https://i.imgur.com/ZsKuh8W.png')
      .setFooter(
        `${ctx.locale('commands:support.embed_footer')} ${ctx.message.author.tag}`,
        ctx.message.author.displayAvatarURL(),
      )
      .setTimestamp();
    await ctx.sendC(ctx.message.author.toString(), embed);
  }
}
