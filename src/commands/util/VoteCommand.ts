import CommandContext from '@structures/CommandContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';
import Command from '../../structures/Command';

export default class VoteCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'vote',
      aliases: ['votar', 'upvote'],
      cooldown: 5,
      category: 'util',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:vote.embed_title'))
      .setColor('#f763f8')
      .setURL('https://top.gg/bot/708014856711962654/vote')
      .setImage('https://i.imgur.com/27GxqX1.jpg')
      .setDescription(ctx.locale('commands:vote.embed_description'))
      .setFooter(
        `${ctx.locale('commands:vote.embed_footer')} ${ctx.message.author.tag}`,
        ctx.message.author.displayAvatarURL(),
      )
      .setTimestamp();

    await ctx.send(embed);
  }
}
